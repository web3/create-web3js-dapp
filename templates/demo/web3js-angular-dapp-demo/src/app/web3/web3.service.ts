import {
  Injectable,
  type OnDestroy,
  type Signal,
  signal,
  type WritableSignal,
} from '@angular/core';
import { providers, Web3 } from 'web3';

@Injectable({
  providedIn: 'root',
})
export class Web3Service implements OnDestroy {
  web3: Web3 = new Web3();

  private _providers: WritableSignal<providers.EIP6963ProviderDetail[]> =
    signal([]);
  providers: Signal<providers.EIP6963ProviderDetail[]> =
    this._providers.asReadonly();

  private _currentProvider: WritableSignal<
    providers.EIP6963ProviderDetail | undefined
  > = signal(undefined);
  currentProvider: Signal<providers.EIP6963ProviderDetail | undefined> =
    this._currentProvider.asReadonly();

  private _chainId: WritableSignal<bigint | undefined> = signal(undefined);
  chainId: Signal<bigint | undefined> = this._chainId.asReadonly();

  private requestProvidersHandler = this.setProvidersFromResponse.bind(this);
  private updateProvidersHandler = this.setProvidersFromEvent.bind(this);
  private chainChangedHandler = this.handleChainChanged.bind(this);

  constructor() {
    Web3.requestEIP6963Providers().then(this.requestProvidersHandler);
    Web3.onNewProviderDiscovered(this.updateProvidersHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      providers.web3ProvidersMapUpdated as any,
      this.updateProvidersHandler,
    );
    if (this.web3.provider) {
      this.web3.provider.removeListener(
        'chainChanged',
        this.chainChangedHandler,
      );
    }
  }

  setProvider(provider: providers.EIP6963ProviderDetail): void {
    const currentProvider: providers.EIP6963ProviderDetail | undefined =
      this.currentProvider();
    if (currentProvider) {
      currentProvider.provider.removeListener(
        'chainChanged',
        this.chainChangedHandler,
      );
    }

    provider.provider.on('chainChanged', this.chainChangedHandler);
    this.web3.setProvider(provider.provider);
    this._currentProvider.set(provider);
    this.web3.eth.getChainId().then(this._chainId.set);
    localStorage.setItem('provider', provider.info.rdns);
  }

  private setProvidersFromResponse(
    response: providers.EIP6963ProviderResponse,
  ): void {
    const providers: providers.EIP6963ProviderDetail[] = [];
    for (const [, provider] of response) {
      providers.push(provider);
    }

    this._providers.set(providers);
    const cachedProvider: string | null = localStorage.getItem('provider');
    if (cachedProvider !== null && this.currentProvider() === undefined) {
      const targetProvider:
        | providers.EIP6963ProviderDetail<unknown>
        | undefined = providers.find(
        (provider: providers.EIP6963ProviderDetail) =>
          provider.info.rdns === cachedProvider,
      );
      if (targetProvider !== undefined) {
        this.setProvider(targetProvider);
      }
    }
  }

  private setProvidersFromEvent(
    event: providers.EIP6963ProvidersMapUpdateEvent,
  ): void {
    this.setProvidersFromResponse(event.detail);
  }

  private handleChainChanged() {
    this.web3.eth.getChainId().then(this._chainId.set);
  }
}
