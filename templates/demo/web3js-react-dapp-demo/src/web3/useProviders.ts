import { useSyncExternalStore } from "react";
import { providers, Web3 } from "web3";

let providerList: providers.EIP6963ProviderDetail[] = [];

/**
 * External store for subscribing to EIP-6963 providers
 * https://metamask.io/news/developers/how-to-implement-eip-6963-support-in-your-web-3-dapp/
 */
const providerStore = {
  getSnapshot: () => providerList,
  subscribe: (callback: () => void) => {
    function setProviders(response: providers.EIP6963ProviderResponse) {
      providerList = [];
      for (const [, provider] of response) {
        providerList.push(provider);
      }

      callback();
    }

    Web3.requestEIP6963Providers().then(setProviders);

    function updateProviders(
      providerEvent: providers.EIP6963ProvidersMapUpdateEvent,
    ) {
      setProviders(providerEvent.detail);
    }

    Web3.onNewProviderDiscovered(updateProviders);

    return () =>
      window.removeEventListener(
        providers.web3ProvidersMapUpdated as any,
        updateProviders,
      );
  },
};

export const useProviders = () =>
  useSyncExternalStore(providerStore.subscribe, providerStore.getSnapshot);
