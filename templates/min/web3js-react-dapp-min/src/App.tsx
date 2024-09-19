import { useEffect, useState } from "react";
import { Web3 } from "web3";
import "./App.css";

function App() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [latestBlock, setLatestBlock] = useState<string | null>(null);
  const [accountButtonDisabled, setAccountButtonDisabled] =
    useState<boolean>(false);
  const [accounts, setAccounts] = useState<string[] | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState<string | null>(null);
  const [signingResult, setSigningResult] = useState<string | null>(null);
  const [originalMessage, setOriginalMessage] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [signingAccount, setSigningAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // ensure that there is an injected the Ethereum provider
    if (window.ethereum) {
      // use the injected Ethereum provider to initialize Web3.js
      setWeb3(new Web3(window.ethereum));
      // check if Ethereum provider comes from MetaMask
      if (window.ethereum.isMetaMask) {
        setProvider("Connected to Ethereum with MetaMask.");
      } else {
        setProvider("Non-MetaMask Ethereum provider detected.");
      }
    } else {
      // no Ethereum provider - instruct user to install MetaMask
      setWarning("Please install MetaMask");
      setAccountButtonDisabled(true);
    }
  }, []);

  useEffect(() => {
    async function getChainId() {
      if (web3 === null) {
        return;
      }

      // get chain ID and populate placeholder
      setChainId(`Chain ID: ${await web3.eth.getChainId()}`);
    }

    async function getLatestBlock() {
      if (web3 === null) {
        return;
      }

      // get latest block and populate placeholder
      setLatestBlock(`Latest Block: ${await web3.eth.getBlockNumber()}`);

      // subscribe to new blocks and update UI when a new block is created
      const blockSubscription = await web3.eth.subscribe("newBlockHeaders");
      blockSubscription.on("data", (block) => {
        setLatestBlock(`Latest Block: ${block.number}`);
      });
    }

    getChainId();
    getLatestBlock();
  }, [web3]);

  // click event for "Request MetaMask Accounts" button
  async function requestAccounts() {
    if (web3 === null) {
      return;
    }

    // request accounts from MetaMask
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("requestAccounts")?.remove();

    // get list of accounts
    const allAccounts = await web3.eth.getAccounts();
    setAccounts(allAccounts);
    // get the first account and populate placeholder
    setConnectedAccount(`Account: ${allAccounts[0]}`);
  }

  // click event for "Sign Message" button
  async function signMessage() {
    if (web3 === null || accounts === null || messageToSign === null) {
      return;
    }

    // sign message with first MetaMask account
    const signature = await web3.eth.personal.sign(
      messageToSign,
      accounts[0],
      "",
    );

    setSigningResult(signature);
  }

  // click event for "Recover Account" button
  async function recoverAccount() {
    if (web3 === null || originalMessage === null || signedMessage === null) {
      return;
    }
    // recover account from signature
    const account = await web3.eth.personal.ecRecover(
      originalMessage,
      signedMessage,
    );

    setSigningAccount(account);
  }
  async function getBalance() {
    if (web3 === null || accounts === null) {
      return;
    }

    // get balance of first account
    const balance = await web3.eth.getBalance(accounts[0]);
    // convert balance from wei to ether
    const balanceInEther = web3.utils.fromWei(balance, "ether");

    setBalance(`Balance: ${balanceInEther} ETH`);
  }
  return (
    <div className="flex flex-col gap-5 items-center justify-center w-full h-screen">
      <div id="warn" style={{ color: "red" }}>
        {warning}
      </div>
      <div className="flex items-center">
        <img src='/logo.svg' className="w-40" alt="logo" />
        <img src='/connection.jpg' className="w-20" alt="" />
        <img src='/web3js.svg' className="w-52" alt="web3js logo" />
      </div>
      <div id="provider">{provider}</div>
      <div id="chainId">{chainId}</div>
      <div id="latestBlock">{latestBlock}</div>
      <div id="connectedAccount">{connectedAccount}</div>
      <div>
        <button
          onClick={() => requestAccounts()}
          id="requestAccounts"
          className="link btn btn-primary"
          disabled={accountButtonDisabled}
        >
          Request MetaMask Accounts
        </button>
      </div>
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-start gap-4 w-1/3">
          <button
            onClick={() => getBalance()}
            id="getBalance"
            className="btn btn-primary"
            disabled={connectedAccount === null}
          >
            Get Balance
          </button>
          {balance && <div id="balanceResult">{balance}</div>}
        </div>
      </div>
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-start gap-4 w-1/3">
          <input
            onChange={(e) => {
              setMessageToSign(e.target.value);
            }}
            id="messageToSign"
            placeholder="Message to Sign"
            className="input input-bordered w-full"
            disabled={connectedAccount === null}
          />
          <button
            onClick={() => signMessage()}
            id="signMessage"
            className="btn btn-primary"
            disabled={connectedAccount === null}
          >
            Sign Message
          </button>
          <div id="signingResult">{signingResult}</div>
        </div>
      </div>
      <div className="flex items-center justify-center w-full">
        <div className="flex flex-col items-start gap-4 w-1/3">
          <input
            onChange={(e) => {
              setOriginalMessage(e.target.value);
            }}
            id="originalMessage"
            placeholder="Original Message"
            className="input input-bordered w-full"
            disabled={connectedAccount === null}
          />
          <input
            onChange={(e) => {
              setSignedMessage(e.target.value);
            }}
            id="signedMessage"
            className="input input-bordered w-full"
            placeholder="Signed Message"
            disabled={connectedAccount === null}
          />
          <button
            className="btn btn-info"
            onClick={() => recoverAccount()}
            id="recoverAccount"
            disabled={connectedAccount === null}
          >
            Recover Account
          </button>
          <div id="signingAccount">{signingAccount}</div>
        </div>
      </div>
    </div>
  );
}

export default App;