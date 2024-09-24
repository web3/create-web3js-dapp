import { Component, Pipe, type PipeTransform, type Signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Web3Service } from './web3/web3.service';
import { type providers } from 'web3';

@Pipe({
  name: 'removeProvider',
  standalone: true,
})
export class RemoveProviderPipe implements PipeTransform {
  transform(
    value: providers.EIP6963ProviderDetail[],
    target: providers.EIP6963ProviderDetail | undefined,
  ): providers.EIP6963ProviderDetail[] {
    if (target === undefined) {
      return value;
    }

    return value.filter(
      (provider: providers.EIP6963ProviderDetail) =>
        provider.info.uuid !== target.info.uuid,
    );
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RemoveProviderPipe, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  providers: Signal<providers.EIP6963ProviderDetail[]>;
  currentProvider: Signal<providers.EIP6963ProviderDetail | undefined>;
  chainId: Signal<bigint | undefined>;
  constructor(protected web3Service: Web3Service) {
    this.providers = web3Service.providers;
    this.currentProvider = web3Service.currentProvider;
    this.chainId = web3Service.chainId;
  }
}
