/// <reference types="react-scripts" />

import type { EIP1193Provider, Web3APISpec } from 'web3';

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}
