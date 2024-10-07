import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Web3Service } from './web3/web3.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  hasProvider: boolean;
  chainId: WritableSignal<bigint> = signal(0n);

  constructor(web3Service: Web3Service) {
    this.hasProvider = web3Service.provider !== undefined;
    if (this.hasProvider) {
      web3Service.web3.eth.getChainId().then(this.chainId.set)
    }
  }
}
