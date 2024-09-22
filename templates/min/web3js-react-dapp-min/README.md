# Web3.js + React Minimal dApp Template

This project is a minimal template for using [Web3.js](https://web3js.org/) with
[React](https://react.dev/).

- [Web3.js Docs](https://docs.web3js.org/)
- [React Docs](https://react.dev/learn)

This project was bootstrapped with
[Create React App](https://github.com/facebook/create-react-app).

## Getting Started

Install the project dependencies with a dependency manager like npm or Yarn. Use
`npm start` to start a local development server and navigate to
http://localhost:3000 to view the dApp.

## Project Design

This project defines a service in
[./src/web3/web3-service.ts](./src/web3/web3-service.ts) that exposes an
instance of the [`Web3` class](https://docs.web3js.org/api/web3/class/Web3) and
an [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) provider, if present. If
the provider is present, it's used by the `Web3` instance to communicate with
the network and the service registers a
[`chainChanged` handler](https://docs.metamask.io/wallet/reference/provider-api/#chainchanged)
that reloads the page. Refer to [./src/App.tsx](./src/App.tsx) for an example of
using the service.
