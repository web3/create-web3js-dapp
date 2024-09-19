import { MetaMaskProvider } from "web3";

/// <reference types="react-scripts" />

declare global {
  interface Window {
    ethereum: MetaMaskProvider<any>;
  }
}