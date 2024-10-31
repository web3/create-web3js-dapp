import networksData from "./networksData.json"

// networks
export interface INetwork {
  chainId: number
  name: string
  rpcUrl: string
}

const typedNetworksData: Record<string, INetwork> = networksData

export function getNetwork(chainId?: string): INetwork {
  const chainToUse = chainId || Cypress.env("network") || "11155111"
  const network = typedNetworksData[chainToUse]

  if (!network) {
    throw new Error(`Network ${chainToUse} is not supported`)
  }

  // Replace environment variables in the RPC URL
  let rpcUrl = network.rpcUrl

  if (rpcUrl.includes("{INFURA_API_KEY}")) {
    rpcUrl = rpcUrl.replace("{INFURA_API_KEY}", Cypress.env("infura_api_key") || "")
  }
  if (rpcUrl.includes("{ALCHEMY_API_KEY}")) {
    rpcUrl = rpcUrl.replace("{ALCHEMY_API_KEY}", Cypress.env("alchemy_api_key") || "")
  }
  if (rpcUrl.includes("{CHAINSTACK_API_KEY}")) {
    rpcUrl = rpcUrl.replace("{CHAINSTACK_API_KEY}", Cypress.env("chainstack_api_key") || "")
  }

  return {
    ...network,
    rpcUrl,
  }
}