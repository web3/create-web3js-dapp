# Web3.js + React Demonstration dApp

This project is a demonstration dApp built with [Web3.js](https://web3js.org/)
and [React](https://react.dev/).

- [Web3.js Docs](https://docs.web3js.org/)
- [React Docs](https://react.dev/learn)

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

## Getting Started

Install the project dependencies with a dependency manager like npm or Yarn. Use
`npm start` to start a local development server and navigate to
http://localhost:3000 to view the dApp.

## Project Design

This project defines a number of components to showcase using Web3.js to build a
dApp.

### EIP-6963 Provider Store

[EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) is a way for dApp developers
to discover multiple injected Ethereum providers. This demonstration dApp
defines a
[`useSyncExternalStore` hook](https://react.dev/reference/react/useSyncExternalStore)
in [./src/web3/useProviders.ts](./src/web3/useProviders.ts) that exposes the
available EIP-6963 providers. The design for this implementation was inspired by
the
[How to Implement EIP-6963 Support in your Web3 Dapp](https://metamask.io/news/developers/how-to-implement-eip-6963-support-in-your-web-3-dapp/)
article published by MetaMask and makes use of Web3.js features that are exposed
under the
[`providers` namespace](https://docs.web3js.org/api/web3/namespace/providers/).

### Web3 Context

The `Web3Provider` defined in
[./src/web3/Web3Context.tsx](./src/web3/Web3Context.tsx) is a React component
that provides child components with a
[context](https://react.dev/learn/passing-data-deeply-with-context) for
interacting with the EIP-6963 providers and a shared, managed instance of the
[`Web3` class](https://docs.web3js.org/api/web3/class/Web3). The `Web3Provider`
exposes a mechanism for setting the `Web3` provider and caches the identifier of
the most recently used provider using the browser's
[local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) -
this value is used to set the provider when the page is reloaded.

### Account Context

Another context provider, `AccountProvider`, is defined in
[./src/web3/AccountContext.tsx](./src/web3/AccountContext.tsx). This context
provides access to the accounts exposed by the selected EIP-6963 provider.

### Index

The [`index.tsx` file](./src/index.tsx) wraps the entire React app in a
`Web3Provider` component, which means all child components can use the React
[`useContext` hook](https://react.dev/reference/react/useContext) to access the
Web3 context.

### App Component

[This component](./src/App.tsx) is the entrypoint to the React app. It uses the
Web3 context to check for the presence of EIP-6963 providers and, if there is at
least one, displays buttons (defined in
[./src/ProviderButton.tsx](./src/ProviderButton.tsx)) that allow the user to
select which provider to use. If no providers are found, a message is displayed
that instructs the user to install a wallet browser extension. If more than one
provider is available, buttons for switching providers are presented. Once a
provider has been selected, the chain ID is displayed along with other dApp
components.

### Accounts Component

The [Accounts component](./src/Accounts.tsx) uses the `AccountProvider` to check
if any accounts are available and displays information about each account that
is present. If no accounts are found, a button is presented that allows the user
to request account access from the wallet provider.

### Account Detail Component

This component, which is defined in
[./src/AccountDetail.tsx](./src/AccountDetail.tsx), lists the address and
balance of an account, and provides a form that can be used to transfer ETH from
that account to another account. The account balance is kept up-to-date by
[subscribing to new blocks](https://docs.web3js.org/api/web3-eth/class/NewHeadsSubscription)
and requesting the balance every time a new block is produced.
[Event subscriptions](https://docs.web3js.org/api/web3/class/Web3PromiEvent#on)
are also used to track the status of ETH transfers and display these statuses to
the user.

### ERC-20 Component

The [`Erc20.tsx` file](./src/Erc20.tsx) provides a component for deploying
ERC-20 contracts. The component maintains a list of all the deployed contracts
and displays details for each one.

### ERC-20 Detail Component

[This component](./src/Erc20Detail.tsx) lists the details of an ERC-20 contract
(e.g. address, name, symbol) and provides a form that can be used to transfer
the tokens associated with that contract from one of the provider accounts to
another account. The component
[subscribes](https://docs.web3js.org/api/web3-eth-contract/class/Contract#events)
to the contract's `Transfer` event to track the balance for the selected
account.
