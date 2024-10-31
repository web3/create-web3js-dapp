import {
  type ChangeEvent,
  type FormEvent,
  type MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { v4 as uuid } from "uuid";

import type { SendTransactionEvents, NewHeadsSubscription } from "web3-eth";

import { type IWeb3Context, Web3Context } from "./web3/Web3Context";
import type {
  DataFormat,
  EIP6963ProviderDetail,
  TransactionReceipt,
  Web3PromiEvent,
} from "web3";

function AccountDetail({ address }: { address: string }) {
  const web3Context: IWeb3Context = useContext(Web3Context);

  const [transferTo, setTransferTo] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<bigint | undefined>(
    undefined
  );
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Map<string, string>>(
    new Map()
  );

  type TransferEvent = Web3PromiEvent<
    TransactionReceipt,
    SendTransactionEvents<DataFormat>
  >;
  const transferEvents = useRef<Map<string, TransferEvent>>(new Map());

  // update transactions
  useEffect(() => {
    const currentProvider: EIP6963ProviderDetail | undefined =
      web3Context.currentProvider;

    if (currentProvider === undefined) {
      return;
    }

    function clearTransactions() {
      setTransactions(new Map());
      transferEvents.current.forEach((transferEvent: TransferEvent) => {
        transferEvent.removeAllListeners();
      });
      transferEvents.current = new Map();
    }

    currentProvider.provider.on("chainChanged", clearTransactions);

    return () =>
      currentProvider.provider.removeListener(
        "chainChanged",
        clearTransactions
      );
  });

  const [balance, setBalance] = useState<number>(NaN);
  const subscriptionId: MutableRefObject<string | undefined> =
    useRef(undefined);

  // update balance
  useEffect(() => {
    updateBalance();

    if (!web3Context.web3.subscriptionManager.supportsSubscriptions()) {
      return;
    }

    web3Context.web3.eth
      .subscribe("newBlockHeaders")
      .then((newBlockSubscription: NewHeadsSubscription) => {
        subscriptionId.current = newBlockSubscription.id;
        newBlockSubscription.on("data", () => {
          updateBalance();
        });
      });

    return () => {
      web3Context.web3.eth.subscriptionManager.unsubscribe(
        ({ id }) => subscriptionId.current === id
      );
    };
  });

  function updateBalance(): void {
    web3Context.web3.eth.getBalance(address).then((balance: bigint) => {
      setBalance(parseFloat(web3Context.web3.utils.fromWei(balance, "ether")));
    });
  }

  function isValidAddress(address: string): boolean {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
  }

  function transferFormChange(e: ChangeEvent<HTMLInputElement>): void {
    let to: string = transferTo;
    if (e.target.name === "to") {
      to = e.target.value;
      setTransferTo(to);
    }

    let amount: bigint | undefined = transferAmount;
    if (e.target.name === "amount") {
      amount = BigInt(e.target.value);
      setTransferAmount(amount);
    }

    setIsFormValid(isValidAddress(to) && amount !== undefined);
  }

  function transfer(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const formData: FormData = new FormData(e.currentTarget);

    const to: FormDataEntryValue | null = formData.get("to");
    if (to === null || !isValidAddress(to as string)) {
      return;
    }

    const amount: FormDataEntryValue | null = formData.get("amount");
    if (amount === null) {
      return;
    }

    const value: bigint | undefined =
      (amount as string) !== "" ? BigInt(amount as string) : undefined;
    if (value === undefined) {
      return;
    }

    setTransferTo("");
    setTransferAmount(undefined);
    setIsFormValid(false);

    const transactionId: string = uuid();
    setTransactions((prev: Map<string, string>) => {
      const next: Map<string, string> = new Map(prev);
      next.set(transactionId, `Preparing to send ${amount} ether to ${to}`);
      return next;
    });

    const transferEvent: TransferEvent = web3Context.web3.eth
      .sendTransaction({
        from: address,
        to: to as string,
        value: web3Context.web3.utils.toWei(value, "ether"),
      })
      .on("sent", () => {
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(transactionId, `Sending ${amount} ether to ${to}`);
          return next;
        });
      })
      .on("transactionHash", (data) => {
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(
            transactionId,
            `Sending ${amount} ether to ${to} [Hash: ${data}]`
          );

          return next;
        });
      })
      .on("receipt", (data) => {
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(
            transactionId,
            `${amount} ether sent to ${to} [Hash: ${data.transactionHash} Block #: ${data.blockNumber}]`
          );

          return next;
        });
      })
      .on("confirmation", (data) => {
        const numConfirmations: bigint = data.confirmations;
        const receipt = data.receipt;
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(
            transactionId,
            `${amount} ether sent to ${to} [Hash: ${receipt.transactionHash} Block #: ${receipt.blockNumber} Confirmations: ${numConfirmations}]`
          );

          return next;
        });

        if (numConfirmations > 5) {
          transferEvent.removeAllListeners();
          transferEvents.current.delete(transactionId);
        }
      })
      .on("error", (data) => {
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(
            transactionId,
            `Error sending ${amount} ether to ${to}: ${data}`
          );

          return next;
        });

        transferEvent.removeAllListeners();
        transferEvents.current.delete(transactionId);
      });

    transferEvents.current.set(transactionId, transferEvent);

    transferEvent.catch((error: any) => {
      transferEvent.removeAllListeners();
      transferEvents.current.delete(transactionId);
      if (error.code === 100) {
        // user rejected transaction
        setTransactions((prev: Map<string, string>) => {
          const next: Map<string, string> = new Map(prev);
          next.delete(transactionId);
          return next;
        });
      } else {
        setTransactions((prev: Map<string, string>) => {
          const next = new Map<string, string>(prev);
          next.set(
            transactionId,
            `Error sending ${amount} wei to ${to}: ${error}`
          );

          return next;
        });
      }
    });
  }

  return (
    <>
      <div data-cy="label-address">{address}</div>
      <div>
        <div>Balance in ether: </div>
        <div data-cy="label-balance">{`${balance}`}</div>
      </div>
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
          Transfer amount in ether:{" "}
          <input
            value={
              transferAmount === undefined ? "" : transferAmount.toString()
            }
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
      {[...transactions].map(([id, msg]) => {
        return <div key={id}>{msg}</div>;
      })}
    </>
  );
}

export default AccountDetail;
