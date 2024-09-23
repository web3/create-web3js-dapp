# Web3.js + Angular Minimal dApp Template

This project is a minimal template for using [Web3.js](https://web3js.org/) with
[Angular](https://angular.dev/).

- [Web3.js Docs](https://docs.web3js.org/)
- [Angular Docs](https://angular.dev/overview)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version
18.2.4.

## Getting Started

Install the project dependencies with a dependency manager like npm or Yarn. Use `npm start` to
start a local development server and navigate to http://localhost:4200/ to view the dApp.

## Project Design

This project defines an [injectable service](https://angular.dev/guide/di) in
[./src/app/web3/web3.service.ts](./src/app/web3/web3.service.ts) that exposes an instance of the
[`Web3` class](https://docs.web3js.org/api/web3/class/Web3) and an
[EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) provider, if present. If the provider is
present, it's used by the `Web3` instance to communicate with the network and the service registers
a [`chainChanged` handler](https://docs.metamask.io/wallet/reference/provider-api/#chainchanged)
that reloads the page. Refer to [./src/app/app.component.ts](./src/app/app.component.ts) and
[./src/app/app.component.html](./src/app/app.component.html) for an example of using the service.
