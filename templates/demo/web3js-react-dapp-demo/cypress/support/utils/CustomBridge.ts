import type { Web3BaseWalletAccount } from "web3";
import {
  ERR_RPC_TRANSACTION_REJECTED,
  ERR_RPC_UNSUPPORTED_METHOD,
  Web3,
} from "web3";
import type { Web3Account } from "web3-eth-accounts";
import EventEmitter from "events";

import { getNetwork, type INetwork } from "../../fixtures/contractsData";

export class CustomBridge extends EventEmitter {
  provider: Web3;
  wallet: Web3BaseWalletAccount;

  constructor(account: Web3Account | undefined, provider: Web3) {
    super();
    if (!account) {
      throw new Error("Account must be provided.");
    }

    if (!provider.eth.wallet) {
      throw new Error("Wallet is invalid. Verify private key.");
    }

    const wallet = provider.eth.wallet.add(account);
    provider.eth.defaultAccount = account.address;

    this.wallet = wallet[0];
    this.provider = provider;
  }

  private shouldFailTransaction: boolean = false;

  public async getTransactionCount(): Promise<string> {
    const currentNonce = await this.provider.eth.getTransactionCount(
      this.wallet.address,
      "pending"
    );
    return this.provider.utils.toHex(currentNonce);
  }

  public async getBalance(): Promise<string> {
    var balance = await this.provider.eth.getBalance(this.wallet.address);
    const balanceInEther = this.provider.utils.fromWei(balance, "ether");

    return balanceInEther;
  }

  public setShouldFailTransaction(value: boolean): void {
    this.shouldFailTransaction = value;
  }

  public switchNetwork(network: INetwork): void {
    const web3 = new Web3(network.rpcUrl);
    const privateKey = this?.wallet?.privateKey || "";
    const newWallet = web3?.eth?.wallet?.add(privateKey);

    if (!newWallet) {
      throw new Error("Wallet is invalid. Verify private key.");
    }

    this.wallet = newWallet[0];
    this.provider = web3;
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || []);
  }

  async sendAsync(...args: Array<any>): Promise<any> {
    return this.send(...args);
  }

  async send(...args: Array<any>): Promise<any> {
    const isCallbackForm =
      typeof args[0] === "object" && typeof args[1] === "function";
    let callback;
    let method;
    let params;
    if (isCallbackForm) {
      callback = args[1];
      method = args[0].method;
      params = args[0].params;
    } else {
      method = args[0];
      params = args[1];
    }

    try {
      const result = await this.sendInternal(method, isCallbackForm, params);
      if (isCallbackForm) {
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      console.log("error " + error);
      if (isCallbackForm) {
        callback(error, null);
      } else {
        throw error;
      }
    }
  }

  private async sendInternal(
    method: string,
    isCallbackForm: boolean,
    params?: Array<any>
  ): Promise<any> {
    function throwUnsupported(message: string): never {
      throw new Error(
        `Error: ${message}, Type: ${ERR_RPC_UNSUPPORTED_METHOD}, Method: ${method}, Params: ${JSON.stringify(
          params
        )}`
      );
    }
    let coerce = (value: any): any => value;
    if (!params) {
      params = [];
    }

    switch (method) {
      case "eth_gasPrice": {
        const result = await this.provider.eth.getGasPrice();
        return this.provider.utils.toHex(result);
      }
      case "eth_accounts":
      case "eth_requestAccounts": {
        if (isCallbackForm) {
          return { result: [this.wallet?.address.toLowerCase()] };
        } else {
          return Promise.resolve([this.wallet?.address.toLowerCase()]);
        }
      }
      case "eth_blockNumber": {
        return await this.provider.eth.getBlockNumber();
      }
      case "eth_chainId": {
        const result = await this.provider.eth.getChainId();

        return this.provider.utils.toHex(result);
      }
      case "net_version": {
        const result = await this.provider.eth.net.getId();

        return this.provider.utils.toHex(result);
      }
      case "eth_getBalance": {
        const result = await this.provider.eth.getBalance(params[0], params[1]);
        return this.provider.utils.toHex(result);
      }
      case "eth_getStorageAt": {
        return this.provider.eth.getStorageAt(params[0], params[1], params[2]);
      }
      case "eth_getTransactionCount": {
        const result = await this.provider.eth.getTransactionCount(
          params[0],
          params[1]
        );
        return this.provider.utils.toHex(result);
      }
      case "eth_getBlockTransactionCountByHash":
      case "eth_getBlockTransactionCountByNumber": {
        const result = await this.provider.eth.getBlock(params[0]);
        return this.provider.utils.toHex(result.transactions.length);
      }
      case "eth_getCode": {
        const result = await this.provider.eth.getCode(params[0], params[1]);
        return result;
      }
      case "eth_sendRawTransaction": {
        return await this.provider.eth.sendTransaction(params[0]);
      }
      case "eth_call": {
        return await this.provider.eth.call(params[0], params[1]);
      }
      case "eth_estimateGas":
      case "estimateGas": {
        if (params[1] && params[1] !== "latest") {
          throwUnsupported("estimateGas does not support blockTag");
        }

        const result = await this.provider.eth.estimateGas(params[0]);
        return this.provider.utils.toHex(result);
      }

      case "eth_getBlockByHash":
      case "eth_getBlockByNumber": {
        if (params[1]) {
          return await this.provider.eth.getBlockTransactionCount(params[0]);
        } else {
          return await this.provider.eth.getBlock(params[0]);
        }
      }
      case "eth_getTransactionByHash": {
        let attempts = 0;
        while (attempts < 10) {
          try {
            const receipt = await this.provider.eth.getTransaction(params[0]);
            if (receipt) {
              return receipt;
            }
          } catch (error) {
            console.error("Polling error: ", error);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts += 1;
        }

        throw new Error("Transaction receipt not found after max attempts");
      }
      case "eth_getTransactionReceipt": {
        return await this.provider.eth.getTransactionReceipt(params[0]);
      }

      case "eth_sign": {
        if (!this.provider.eth) {
          return throwUnsupported("eth_sign requires an account");
        }
        const accounts = await this.provider.eth.getAccounts();
        const address = accounts[0];
        if (address !== this.provider.utils.toChecksumAddress(params[0])) {
          throw new Error("account mismatch or account not found " + params[0]);
        }

        return this.provider.eth.sign(params[1], address);
      }

      case "eth_sendTransaction": {
        if (!this.provider.eth) {
          return throwUnsupported("eth_sendTransaction requires an account");
        }
        if (this.shouldFailTransaction) {
          return console.log(
            "User rejected the transaction.",
            ERR_RPC_TRANSACTION_REJECTED,
            {
              method: method,
              params: params,
            }
          );
        }
        const currentNonce = await this.getTransactionCount();
        const updatedTransaction = {
          gasPrice: params[0].gasPrice,
          gasLimit: params[0].gas,
          nonce: this.provider.utils.toHex(currentNonce),
          value: params[0].value,
          to: params[0].to,
          data: params[0].data,
        };
        params[0] = updatedTransaction;
        const transactionHash = await new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Transaction timeout exceeded"));
          }, 60000);

          this.provider.eth
            .sendTransaction(params[0])
            .on("transactionHash", (hash) => {
              clearTimeout(timeout);
              resolve(hash);
            })
            .on("error", (error) => {
              clearTimeout(timeout);
              reject(error);
            });
        });

        return transactionHash;
      }
      case "eth_getUncleCountByBlockHash":
      case "eth_getUncleCountByBlockNumber": {
        coerce = this.provider.utils.toHex;
        break;
      }
      case "wallet_switchEthereumChain": {
        const chainId = parseInt(params[0].chainId, 16);
        try {
          const network = getNetwork(chainId.toString());

          const web3 = new Web3(network.rpcUrl);
          const privateKey = this?.wallet?.privateKey || "";
          const newWallet = web3?.eth?.wallet?.add(privateKey);

          if (!newWallet) {
            throw new Error("Wallet is invalid. Verify private key.");
          }

          this.wallet = newWallet[0];
          this.provider = web3;

          return this.send("eth_chainId", []);
        } catch (e: any) {
          return throwUnsupported(e.toString());
        }
      }
      case "eth_subscribe": {
        const subscriptionType = params[0];

        if (subscriptionType === "newHeads") {
          this.provider.eth.subscribe(
            "newBlockHeaders",
            (error: any, result: any) => {
              if (error) {
                console.error("Subscription error:", error);
              } else {
                super.emit("newBlockHeader", result);
              }
            }
          );

          const subscriptionId = `sub_${Date.now()}`;

          return subscriptionId;
        }

        throwUnsupported(
          `Subscription type ${subscriptionType} is not supported`
        );
        break;
      }
      case "eth_unsubscribe": {
        const subscriptionId = params[0];

        if (
          this.provider.eth.subscriptionManager.subscriptions.has(
            subscriptionId
          )
        ) {
          this.provider.eth.clearSubscriptions(subscriptionId);
          return true;
        }
        return false;
      }

      case "eth_getTransactionByBlockHashAndIndex":
      case "eth_getTransactionByBlockNumberAndIndex":
      case "eth_getUncleByBlockHashAndIndex":
      case "eth_getUncleByBlockNumberAndIndex":
      case "eth_newFilter":
      case "eth_newBlockFilter":
      case "eth_newPendingTransactionFilter":
      case "eth_uninstallFilter":
      case "eth_getFilterChanges":
      case "eth_getFilterLogs":
      case "eth_getLogs":
        break;
    }

    // If our provider supports send, maybe it can do a better job?
    if ((<any>this.provider).send) {
      const result = await (<any>this.provider).send(method, params);
      return coerce(result);
    }

    return throwUnsupported(`unsupported method: ${method}`);
  }
}
