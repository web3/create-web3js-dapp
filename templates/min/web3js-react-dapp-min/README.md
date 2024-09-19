# Web3.js + React Minimal dApp Template

This project is a minimal template for using Web3.js with React.

## Documentation

- [Web3.js Docs](https://web3js.readthedocs.io/)
- [React Docs](https://reactjs.org/)

This project was generated with Create React App.

## Getting Started

1. Install the project dependencies with a dependency manager like npm or Yarn:

    ```bash
    npm install
    # or
    yarn install
    ```

2. Start a local development server:

    ```bash
    npm start
    # or
    yarn start
    ```

3. Navigate to `http://localhost:3000/` to view the dApp.

## Project Design

This project defines a web3 instance in `./src/` that exposes an instance of the Web3 class and an EIP-1193 provider, if present. If the provider is present, it's used by the Web3 instance to communicate with the network and registers a `chainChanged` handler that reloads the page. Refer to [`./src/App.tsx`](./src/App.tsx) and [`./src/App.css`](./src/App.css) for an example of using the web3 instance.

## Acknowledgements

- [Web3.js](https://github.com/web3/web3.js)
- [React](https://reactjs.org/)
- [MetaMask](https://metamask.io/)

## Contact

If you have any questions or suggestions, feel free to open an issue or contact me at [mkrana173@gmail.com].

---

Happy coding! 🚀