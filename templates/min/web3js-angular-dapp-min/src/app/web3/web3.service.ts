import { Injectable, type OnDestroy } from '@angular/core';
import { type EIP1193Provider, Web3, type Web3APISpec } from 'web3';

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}

@Injectable({
  providedIn: 'root',
})
export class Web3Service implements OnDestroy {
  private static handleChainChanged() {
    window.location.reload();
  }

  web3: Web3 = new Web3();
  provider: EIP1193Provider<Web3APISpec> | undefined;

  constructor() {
    if (!window.ethereum) {
      return;
    }

    this.provider = window.ethereum;
    this.web3.setProvider(this.provider);

    this.provider.on('chainChanged', Web3Service.handleChainChanged);
  }

  ngOnDestroy(): void {
    if (this.provider) {
      this.provider.removeListener('chainChanged', Web3Service.handleChainChanged);
    }
  }
}
