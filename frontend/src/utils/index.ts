import { constants, num } from "starknet"
import { getChecksumAddress } from "starknet"
import { Address } from "@starknet-react/core"

export const toHexChainid = (chainId?: bigint): string | null =>
  typeof chainId === "bigint" ? num.toHex(chainId ?? 0) : null

export const isMainnet = (hexChainId: string | null) =>
  hexChainId === constants.StarknetChainId.SN_MAIN

const isTestnet = (hexChainId: string | null) =>
  hexChainId === constants.StarknetChainId.SN_SEPOLIA

export const colorMap: { [key: number]: { name: string; hex: string } } = {
  0: { name: 'Red', hex: '#FF0000' },
  1: { name: 'Blue', hex: '#0000FF' },
  2: { name: 'Green', hex: '#00FF00' },
  3: { name: 'Yellow', hex: '#FFFF00' },
  4: { name: 'Purple', hex: '#800080' },
};

export function feltToString(felt: any): string {
  if (felt === 0 || !felt) return 'Unnamed';
  try {
    return String.fromCharCode(...felt.toString().split('').map(Number));
  } catch {
    return 'Unnamed';
  }
}
export const normalizeAddress = (address: string) =>
  getChecksumAddress(address) as Address

export const formatTruncatedAddress = (address: string) => {
  const normalized = normalizeAddress(address)
  const hex = normalized.slice(0, 2)
  const start = normalized.slice(2, 6)
  const end = normalized.slice(-4)
  return `${hex}${start}…${end}`
}

export const upperFirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}