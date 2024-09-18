import { Injectable, type OnDestroy } from '@angular/core';
import { type EIP1193Provider, Web3, type Web3APISpec } from 'web3';

@Injectable({
  providedIn: 'root',
})
export class Web3Service implements OnDestroy {
  web3: Web3 = new Web3();
  provider: EIP1193Provider<Web3APISpec> | undefined;

  constructor() {
    if (!window.ethereum) {
      return;
    }

    this.provider = window.ethereum;
    this.web3.setProvider(this.provider);

    this.provider.on('chainChanged', this.handleChainChanged);
  }

  ngOnDestroy(): void {
    if (this.provider) {
      this.provider.removeListener('chainChanged', this.handleChainChanged);
    }
  }

  private async handleChainChanged() {
    window.location.reload();
  }
}

declare global {
  interface Window {
    ethereum?: EIP1193Provider<Web3APISpec>;
  }
}
