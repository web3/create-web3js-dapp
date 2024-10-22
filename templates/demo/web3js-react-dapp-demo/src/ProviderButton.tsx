import { useContext } from "react";

import { EIP6963ProviderDetail } from "web3";

import "./ProviderButton.css";
import { IWeb3Context, Web3Context } from "./web3/Web3Context";

function ProviderButton({ provider }: { provider: EIP6963ProviderDetail }) {
  const web3Context: IWeb3Context = useContext(Web3Context);

  return (
    <button onClick={() => web3Context.setCurrentProvider(provider)}>
      <img src={provider.info.icon} alt={provider.info.name} width="35" />
      <span> {provider.info.name}</span>
    </button>
  );
}

export default ProviderButton;
