import { type EIP1193Provider, Web3, type Web3APISpec } from 'web3';

const provider: EIP1193Provider<Web3APISpec> | undefined = window.ethereum;
if (provider !== undefined) {
  provider.on("chainChanged", () => window.location.reload());
}

const web3: Web3 = provider === undefined ? new Web3() : new Web3(provider);
const Web3Service = { provider, web3 };

export default Web3Service;
