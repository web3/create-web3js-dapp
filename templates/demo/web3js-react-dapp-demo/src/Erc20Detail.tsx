import {
  type ChangeEvent,
  type FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Contract } from "web3";

import { AccountContext, type IAccountContext } from "./web3/AccountContext";
import { type IWeb3Context, Web3Context } from "./web3/Web3Context";

import { type Erc20Abi, ERC_20 } from "./Erc20";
import type { LogsSubscription } from "web3-eth-contract";

function Erc20Detail({ address }: { address: string }) {
  const web3Context: IWeb3Context = useContext(Web3Context);
  const accountContext: IAccountContext = useContext(AccountContext);

  const [provider] = useState(web3Context.currentProvider);

  const erc20: Contract<Erc20Abi> = new web3Context.web3.eth.Contract(
    ERC_20.abi,
    address,
  );

  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenSupply, setTokenSupply] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<string>("");

  // update token details
  useEffect(() => {
    if (web3Context.currentProvider !== provider) {
      return;
    }

    erc20.methods.name().call().then(setTokenName);
    erc20.methods.symbol().call().then(setTokenSymbol);
    erc20.methods
      .totalSupply()
      .call()
      .then((supply) => setTokenSupply(supply.toString()));
    erc20.methods
      .decimals()
      .call()
      .then((decimals) => setTokenDecimals(decimals.toString()));
  }, [erc20.methods, provider, web3Context.currentProvider]);

  const [account, setAccount] = useState<string>(
    accountContext.selectedAccount ?? "",
  );

  function updateAccount(e: ChangeEvent<HTMLSelectElement>): void {
    setAccount(e.target.value);
  }

  const [balance, setBalance] = useState<string>("");
  useEffect(() => {
    if (web3Context.currentProvider !== provider) {
      return;
    }

    erc20.methods
      .balanceOf(account)
      .call()
      .then((balance) => setBalance(balance.toString()));

    const transferSubscription: LogsSubscription = erc20.events.Transfer();
    transferSubscription.on("data", (transferEvent) => {
      if (transferEvent.returnValues[0] !== account) {
        return;
      }

      const amount: bigint = BigInt(transferEvent.returnValues[2] as any);

      setBalance((prev) => {
        const next = BigInt(prev) - amount;
        return next.toString();
      });
    });

    return () => {
      web3Context.web3.eth.subscriptionManager.unsubscribe(
        ({ id }) => transferSubscription.id === id,
      );
    };
  }, [
    account,
    erc20.events,
    erc20.methods,
    provider,
    web3Context.currentProvider,
    web3Context.web3.eth.subscriptionManager,
  ]);

  const [transferTo, setTransferTo] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<number>(NaN);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  function isValidAddress(address: string): boolean {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
  }

  function transferFormChange(e: ChangeEvent<HTMLInputElement>): void {
    let to: string = transferTo;
    if (e.target.name === "to") {
      to = e.target.value;
      setTransferTo(to);
    }

    let amount: number = transferAmount;
    if (e.target.name === "amount") {
      amount = parseInt(e.target.value);
      setTransferAmount(amount);
    }

    setIsFormValid(isValidAddress(to) && !isNaN(amount));
  }

  async function transfer(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const formData: FormData = new FormData(e.currentTarget);

    const to: FormDataEntryValue | null = formData.get("to");
    if (to === null || !isValidAddress(to as string)) {
      return;
    }

    const amount: FormDataEntryValue | null = formData.get("amount");
    if (amount === null || isNaN(parseInt(amount as string))) {
      return;
    }

    setTransferTo("");
    setTransferAmount(NaN);
    setIsFormValid(false);

    const gas: bigint = await erc20.methods
      .transfer(to, amount)
      .estimateGas({ from: account });

    const gasPrice: bigint = await web3Context.web3.eth.getGasPrice();
    erc20.methods.transfer(to, amount).send({
      from: account,
      gas: gas.toString(),
      gasPrice: gasPrice.toString(),
    });
  }

  return (
    <>
      <div>Token address: {address}</div>
      <div>Token name: {tokenName}</div>
      <div>Token symbol: {tokenSymbol}</div>
      <div>Total supply: {tokenSupply}</div>
      <div>Decimals: {tokenDecimals}</div>
      <label>
        Account:{" "}
        <select
          name="address"
          value={account}
          onChange={updateAccount}
          style={{ marginBottom: "5px" }}
        >
          {accountContext.accounts.map((account: string) => {
            return <option key={account}>{account}</option>;
          })}
        </select>
      </label>
      <div>Balance: {balance}</div>
      <form onSubmit={transfer}>
        <label>
          Transfer to:{" "}
          <input
            value={transferTo}
            onChange={transferFormChange}
            name="to"
            type="text"
          />
        </label>

        <span style={{ paddingRight: "5px" }}></span>

        <label>
          Transfer amount:{" "}
          <input
            value={!isNaN(transferAmount) ? transferAmount : ""}
            onChange={transferFormChange}
            name="amount"
            type="number"
            step="1"
          />
        </label>

        <span style={{ paddingRight: "5px" }}></span>

        <button type="submit" disabled={!isFormValid}>
          Transfer
        </button>
      </form>
    </>
  );
}

export default Erc20Detail;
