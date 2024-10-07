# `create-web3js-dapp`

Scaffolding utility to create front-end projects (dApps) with Web3.js

## Usage

This utility is designed to be used via
[npx](https://docs.npmjs.com/cli/v8/commands/npx). If the `framework` or
`template` options are omitted, an interactive menu will be displayed to allow
for their selection.

```console
Usage: npx create-web3js-dapp [options]

Options:
  -f, --framework <name>  front-end framework (choices: "angular", "react")
  -t, --template <type>   template type (choices: "demonstration", "minimal")
  -h, --help              display help for command
```

## Template Types

Two types of templates are provided. [Minimal templates](./templates/min) are
designed for users that want to build their own front-end project (dApp) without
the need to remove unnecessary boilerplate code.
[Demonstration templates](./templates/demo) are designed to showcase how Web3.js
can be used to build dApps.

## Front-End Framework

This utility supports the following front-end frameworks:

- [Angular](https://angular.dev/) (only available as a minimal template)
- [React](https://react.dev/)
