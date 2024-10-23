import {
  type ChangeEvent,
  type FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Address, Contract, EIP6963ProviderDetail } from "web3";
import type { DeployerMethodClass } from "web3-eth-contract";

import { AccountContext, type IAccountContext } from "./web3/AccountContext";
import { type IWeb3Context, Web3Context } from "./web3/Web3Context";
import Erc20Detail from "./Erc20Detail";

function Erc20() {
  const web3Context: IWeb3Context = useContext(Web3Context);
  const accountContext: IAccountContext = useContext(AccountContext);

  const erc20: Contract<Erc20Abi> = new web3Context.web3.eth.Contract(
    ERC_20.abi,
  );

  const [deployName, setDeployName] = useState<string>("");
  const [deploySymbol, setDeploySymbol] = useState<string>("");
  const [deployAmount, setDeployAmount] =
    useState<bigint>(10000000000000000000000n);
  const [deployDecimals, setDeployDecimals] = useState<number>(18);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  const [deployedContracts, setDeployedContracts] = useState<Address[]>([]);

  // update deployed contracts
  useEffect(() => {
    const currentProvider: EIP6963ProviderDetail | undefined =
      web3Context.currentProvider;

    if (currentProvider === undefined) {
      return;
    }

    function clearDeployedContracts() {
      setDeployedContracts([]);
    }

    currentProvider.provider.on("chainChanged", clearDeployedContracts);

    return () =>
      currentProvider.provider.removeListener(
        "chainChanged",
        clearDeployedContracts,
      );
  });

  function deployFormChange(e: ChangeEvent<HTMLInputElement>): void {
    let name: string = deployName;
    if (e.target.name === "name") {
      name = e.target.value;
      setDeployName(name);
    }

    let symbol: string = deploySymbol;
    if (e.target.name === "symbol") {
      symbol = e.target.value;
      setDeploySymbol(symbol);
    }

    let amount: bigint = deployAmount;
    if (e.target.name === "amount") {
      amount = BigInt(e.target.value);
      setDeployAmount(amount);
    }

    let decimals: number = deployDecimals;
    if (e.target.name === "decimals") {
      decimals = parseInt(e.target.value);
      setDeployDecimals(decimals);
    }

    setIsFormValid(name !== "" && symbol !== "" && !isNaN(decimals));
  }

  async function submitDeploy(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    const formData: FormData = new FormData(e.currentTarget);

    const address: FormDataEntryValue | null = formData.get("address");
    if (address === null) {
      console.log(address);
      return;
    }

    const name: FormDataEntryValue | null = formData.get("name");
    if (name === null || name === "") {
      return;
    }

    const symbol: FormDataEntryValue | null = formData.get("symbol");
    if (symbol === null || symbol === "") {
      return;
    }

    const amount: FormDataEntryValue | null = formData.get("amount");
    if (amount === null) {
      return;
    }

    const decimals: FormDataEntryValue | null = formData.get("decimals");
    if (decimals === null) {
      return;
    }

    const parsedDecimals: number = parseInt(decimals as string);
    if (isNaN(parsedDecimals)) {
      return;
    }

    setDeployName("");
    setDeploySymbol("");
    setDeployAmount(10000000000000000000000n);
    setDeployDecimals(18);
    setIsFormValid(false);

    const contractAddress: Address = await deploy(
      name as string,
      symbol as string,
      BigInt(amount as string),
      parsedDecimals,
      address as string,
    );

    setDeployedContracts((prev: Address[]) => {
      return [...prev, contractAddress];
    });
  }

  async function deploy(
    tokenName: string,
    tokenSymbol: string,
    initialAmount: bigint,
    decimals: number,
    deployerAddress: Address,
  ): Promise<Address> {
    const deployer: DeployerMethodClass<Erc20Abi> = erc20.deploy({
      arguments: [initialAmount, tokenName, decimals, tokenSymbol],
      data: ERC_20.bytecode,
    });

    const gas: bigint = await deployer.estimateGas({ from: deployerAddress });
    const gasPrice: bigint = await web3Context.web3.eth.getGasPrice();

    const deployedContract: Contract<Erc20Abi> = await deployer.send({
      from: deployerAddress,
      gas: gas.toString(),
      gasPrice: gasPrice.toString(),
    });

    const contractAddress: string | undefined =
      deployedContract.options.address;

    if (contractAddress === undefined) {
      throw new Error("Failed to deploy ERC-20 contract");
    }

    return contractAddress;
  }

  return (
    <>
      <h2>ERC-20 Smart Contracts</h2>
      <h3>Deploy New ERC-20 Smart Contract</h3>
      <form onSubmit={submitDeploy}>
        <label>
          Account:{" "}
          <select name="address" style={{ marginBottom: "5px" }}>
            {accountContext.accounts.map((account: string) => {
              return <option key={account}>{account}</option>;
            })}
          </select>
        </label>

        <br />

        <label>
          Token name:{" "}
          <input
            value={deployName}
            onChange={deployFormChange}
            name="name"
            type="text"
            style={{ marginBottom: "5px" }}
          />
        </label>

        <br />

        <label>
          Token symbol:{" "}
          <input
            value={deploySymbol}
            onChange={deployFormChange}
            name="symbol"
            type="text"
            style={{ marginBottom: "5px" }}
          />
        </label>

        <br />

        <label>
          Initial amount:{" "}
          <input
            value={deployAmount.toString()}
            onChange={deployFormChange}
            name="amount"
            type="number"
            style={{ marginBottom: "5px" }}
          />
        </label>

        <br />

        <label>
          Decimals:{" "}
          <input
            value={!isNaN(deployDecimals) ? deployDecimals : ""}
            onChange={deployFormChange}
            name="decimals"
            type="number"
            style={{ marginBottom: "5px" }}
          />
        </label>

        <br />

        <button type="submit" disabled={!isFormValid}>
          Deploy
        </button>
      </form>
      <h3>Deployed ERC-20 Smart Contracts</h3>
      {deployedContracts.map((address: Address, ndx: number) => {
        return (
          <div key={address}>
            <Erc20Detail address={address}></Erc20Detail>
            {ndx !== deployedContracts.length - 1 ? <br /> : null}
          </div>
        );
      })}{" "}
    </>
  );
}

export default Erc20;

export type Erc20Abi = typeof ERC_20.abi;
// https://gist.github.com/snowfro/c1083ff754a63553a408a2497f83c859
export const ERC_20 = {
  abi: [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "_spender",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          name: "success",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "_from",
          type: "address",
        },
        {
          name: "_to",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "success",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
      ],
      name: "balances",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [
        {
          name: "",
          type: "uint8",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
        {
          name: "",
          type: "address",
        },
      ],
      name: "allowed",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "balance",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "_to",
          type: "address",
        },
        {
          name: "_value",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "success",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "_owner",
          type: "address",
        },
        {
          name: "_spender",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          name: "remaining",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          name: "_initialAmount",
          type: "uint256",
        },
        {
          name: "_tokenName",
          type: "string",
        },
        {
          name: "_decimalUnits",
          type: "uint8",
        },
        {
          name: "_tokenSymbol",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "_from",
          type: "address",
        },
        {
          indexed: true,
          name: "_to",
          type: "address",
        },
        {
          indexed: false,
          name: "_value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "_owner",
          type: "address",
        },
        {
          indexed: true,
          name: "_spender",
          type: "address",
        },
        {
          indexed: false,
          name: "_value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
  ] as const,
  bytecode:
    "0x6060604052341561000f57600080fd5b604051610dd1380380610dd18339810160405280805190602001909190805182019190602001805190602001909190805182019190505083600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508360008190555082600390805190602001906100a79291906100e3565b5081600460006101000a81548160ff021916908360ff16021790555080600590805190602001906100d99291906100e3565b5050505050610188565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061012457805160ff1916838001178555610152565b82800160010185558215610152579182015b82811115610151578251825591602001919060010190610136565b5b50905061015f9190610163565b5090565b61018591905b80821115610181576000816000905550600101610169565b5090565b90565b610c3a806101976000396000f3006060604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100b4578063095ea7b31461014257806318160ddd1461019c57806323b872dd146101c557806327e235e31461023e578063313ce5671461028b5780635c658165146102ba57806370a082311461032657806395d89b4114610373578063a9059cbb14610401578063dd62ed3e1461045b575b600080fd5b34156100bf57600080fd5b6100c76104c7565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101075780820151818401526020810190506100ec565b50505050905090810190601f1680156101345780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561014d57600080fd5b610182600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610565565b604051808215151515815260200191505060405180910390f35b34156101a757600080fd5b6101af610657565b6040518082815260200191505060405180910390f35b34156101d057600080fd5b610224600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803590602001909190505061065d565b604051808215151515815260200191505060405180910390f35b341561024957600080fd5b610275600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919050506108f7565b6040518082815260200191505060405180910390f35b341561029657600080fd5b61029e61090f565b604051808260ff1660ff16815260200191505060405180910390f35b34156102c557600080fd5b610310600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610922565b6040518082815260200191505060405180910390f35b341561033157600080fd5b61035d600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610947565b6040518082815260200191505060405180910390f35b341561037e57600080fd5b610386610990565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103c65780820151818401526020810190506103ab565b50505050905090810190601f1680156103f35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b341561040c57600080fd5b610441600480803573ffffffffffffffffffffffffffffffffffffffff16906020019091908035906020019091905050610a2e565b604051808215151515815260200191505060405180910390f35b341561046657600080fd5b6104b1600480803573ffffffffffffffffffffffffffffffffffffffff1690602001909190803573ffffffffffffffffffffffffffffffffffffffff16906020019091905050610b87565b6040518082815260200191505060405180910390f35b60038054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561055d5780601f106105325761010080835404028352916020019161055d565b820191906000526020600020905b81548152906001019060200180831161054057829003601f168201915b505050505081565b600081600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b60005481565b600080600260008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905082600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015801561072e5750828110155b151561073957600080fd5b82600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555082600160008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825403925050819055507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8110156108865782600260008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825403925050819055505b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef856040518082815260200191505060405180910390a360019150509392505050565b60016020528060005260406000206000915090505481565b600460009054906101000a900460ff1681565b6002602052816000526040600020602052806000526040600020600091509150505481565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60058054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a265780601f106109fb57610100808354040283529160200191610a26565b820191906000526020600020905b815481529060010190602001808311610a0957829003601f168201915b505050505081565b600081600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410151515610a7e57600080fd5b81600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905092915050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050929150505600a165627a7a72305820df254047bc8f2904ad3e966b6db116d703bebd40efadadb5e738c836ffc8f58a0029",
};
