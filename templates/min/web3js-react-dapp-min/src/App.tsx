import { useState } from "react";

import Web3Service from "./web3/web3-service";

function App() {
  const hasProvider = Web3Service.provider !== undefined;
  const [chainId, setChainId] = useState<bigint>(0n);
  if (hasProvider) {
    Web3Service.web3.eth.getChainId().then(setChainId);
  }

  return (
    <main>
      <h1>Web3.js + React Minimal dApp Template</h1>
      <div>
        This is a sample project that demonstrates using{" "}
        <a href="https://web3js.org/">Web3.js</a> with the{" "}
        <a href="https://react.dev/">React</a> front-end framework.
        <ul>
          <li>
            <a href="https://docs.web3js.org/">Web3.js Docs</a>
          </li>
          <li>
            <a href="https://react.dev/learn">React Docs</a>
          </li>
        </ul>
        Learn more about this project and its design by referring to the{" "}
        <a href="https://github.com/web3/create-web3js-dapp/blob/main/templates/min/web3js-react-dapp-min/README.md">
          GitHub README
        </a>
        .
      </div>
      {!hasProvider ? (
        <>
          <h2>Install a Wallet</h2>
          <div>Install a wallet browser extension:</div>
          <ul>
            <li>
              <a href="https://www.enkrypt.com/download.html">Enkrypt</a>
            </li>
            <li>
              <a href="https://www.exodus.com/download/">Exodus</a>
            </li>
            <li>
              <a href="https://metamask.io/download/">MetaMask</a>
            </li>
            <li>
              <a href="https://trustwallet.com/download">Trust Wallet</a>
            </li>
          </ul>
        </>
      ) : (
        <>
          <h2>Network Details</h2>
          <div>Chain ID: {chainId.toString()}</div>
        </>
      )}
      <br />
      <i>
        This project was bootstrapped with{" "}
        <a href="https://github.com/facebook/create-react-app">
          Create React App
        </a>
        .
      </i>
    </main>
  );
}

export default App;
