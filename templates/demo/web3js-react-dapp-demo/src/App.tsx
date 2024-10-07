import { useContext, useEffect, useState } from "react";

import type { ProviderChainId, providers } from "web3";

import { AccountProvider } from "./web3/AccountContext";
import { type IWeb3Context, Web3Context } from "./web3/Web3Context";

import Accounts from "./Accounts";
import ProviderButton from "./ProviderButton";

function App() {
  const web3Context: IWeb3Context = useContext(Web3Context);

  const [hasProviders, setHasProviders] = useState<boolean>(false);
  useEffect(() => {
    setHasProviders(web3Context.providers.length > 0);
  }, [web3Context.providers.length]);

  const [chainId, setChainId] = useState<bigint | undefined>(undefined);
  const [networkId, setNetworkId] = useState<bigint | undefined>(undefined);
  useEffect(() => {
    if (web3Context.currentProvider === undefined) {
      return;
    }

    const provider = web3Context.currentProvider.provider;

    function updateChainId(newId: bigint) {
      setChainId(newId);
    }

    function updateProviderIds(newId: ProviderChainId) {
      setChainId(BigInt(newId));
      web3Context.web3.eth.net.getId().then(setNetworkId);
    }

    web3Context.web3.eth.getChainId().then(updateChainId);
    web3Context.web3.eth.net.getId().then(setNetworkId);
    provider.on("chainChanged", updateProviderIds);
    return () => provider.removeListener("chainChanged", updateProviderIds);
  }, [web3Context.currentProvider, web3Context.web3.eth]);

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
        <a href="https://github.com/web3/create-web3js-dapp/blob/main/templates/demo/web3js-react-dapp-demo/README.md">
          GitHub README
        </a>
        .
      </div>
      {!hasProviders ? (
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
      ) : web3Context.currentProvider === undefined ? (
        <>
          <h2>Select a Provider</h2>
          {web3Context.providers.map(
            (provider: providers.EIP6963ProviderDetail) => {
              return (
                <div key={provider.info.uuid}>
                  <ProviderButton provider={provider}></ProviderButton>
                </div>
              );
            },
          )}
        </>
      ) : (
        <>
          {web3Context.providers.length > 1 ? (
            <>
              <h2>Switch Provider</h2>
              {web3Context.providers.map(
                (provider: providers.EIP6963ProviderDetail) => {
                  if (
                    provider.info.uuid ===
                    web3Context.currentProvider?.info.uuid
                  ) {
                    return null;
                  }
                  return (
                    <div key={provider.info.uuid}>
                      <ProviderButton provider={provider}></ProviderButton>
                    </div>
                  );
                },
              )}
            </>
          ) : null}
          <h2>Network Details</h2>
          <div>Chain ID: {`${chainId}`}</div>
          <div>Network ID: {`${networkId}`}</div>
          <AccountProvider>
            <Accounts></Accounts>
          </AccountProvider>
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
