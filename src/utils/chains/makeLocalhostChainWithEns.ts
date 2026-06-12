import { type Address, type Chain, getAddress } from 'viem'

import { ChainWithEns } from '@ensdomains/ensjs/contracts'

import type { Register } from '@app/local-contracts'

export const makeLocalhostChainWithEns = <T extends Chain>(
  localhost: T,
  deploymentAddressesRaw: Register['deploymentAddresses'],
): ChainWithEns<T> => {
  // SNRC deployment JSONs store addresses lowercase, but ensjs does strict,
  // case-sensitive `===` comparisons against checksummed on-chain values
  // (e.g. getOwner: `registrarOwner === nameWrapperAddress`). A lowercase
  // NameWrapper made getOwner report wrapped names as 'registrar'-owned,
  // hiding ownership-gated actions (Edit/Send). Checksum every address so the
  // comparisons match.
  const deploymentAddresses_ = Object.fromEntries(
    Object.entries(deploymentAddressesRaw ?? {}).map(([k, v]) => [
      k,
      typeof v === 'string' && /^0x[0-9a-fA-F]{40}$/.test(v) ? getAddress(v) : v,
    ]),
  ) as Register['deploymentAddresses']
  return {
    ...localhost,
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://localhost.etherscan.io',
      },
    },
    contracts: {
      ...localhost.contracts,
      ensRegistry: {
        address: deploymentAddresses_.ENSRegistry as Address,
      },
      ensUniversalResolver: {
        address: deploymentAddresses_.UniversalResolver as Address,
      },
      multicall3: {
        address: deploymentAddresses_.Multicall as Address,
      },
      ensBaseRegistrarImplementation: {
        address: deploymentAddresses_.BaseRegistrarImplementation as Address,
      },
      ensDnsRegistrar: {
        address: deploymentAddresses_.DNSRegistrar as Address,
      },
      ensEthRegistrarController: {
        address: deploymentAddresses_.ETHRegistrarController as Address,
      },
      ensNameWrapper: {
        address: deploymentAddresses_.NameWrapper as Address,
      },
      ensPublicResolver: {
        address: deploymentAddresses_.PublicResolver as Address,
      },
      ensReverseRegistrar: {
        address: deploymentAddresses_.ReverseRegistrar as Address,
      },
      ensBulkRenewal: {
        address: deploymentAddresses_.WrappedStaticBulkRenewal as Address,
      },
      ensDnssecImpl: {
        address: deploymentAddresses_.DNSSECImpl as Address,
      },
      legacyEthRegistrarController: {
        address: deploymentAddresses_.LegacyETHRegistrarController as Address,
      },
      legacyPublicResolver: {
        address: deploymentAddresses_.LegacyPublicResolver as Address,
      },
      wrappedEthRegistrarController: {
        address: deploymentAddresses_.WrappedEthRegistrarController as Address,
      },
      wrappedPublicResolver: {
        address: deploymentAddresses_.NameWrapperPublicResolver as Address,
      },
      ensDefaultReverseRegistrar: {
        address: deploymentAddresses_.DefaultReverseRegistrar as Address,
      },
      wrappedBulkRenewal: {
        address: deploymentAddresses_.WrappedStaticBulkRenewal as Address,
      },
    },
    subgraphs: {
      ens: {
        // NEXT_PUBLIC_SUBGRAPH_URL lets the local-dev and Pages builds
        // point at a self-hosted Graph Node (e.g. scripts/subgraph/ in
        // simplex-namespace-contract) without baking the URL into the
        // chain config. Falls back to the legacy localhost:42069 endpoint
        // so the existing `pnpm dev:glocal` flow keeps working.
        url: process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://localhost:42069/subgraph',
      },
    },
  }
}
