/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Supported mainnet coins on BitGo
 */
export const SUPPORTED_COINS = [
  'btc',
  'eth',
  'ltc',
  'xrp',
  'xlm',
  'eos',
  'trx',
  'sol',
  'avaxc',
  'polygon',
  'arbeth',
  'opeth',
  'bsc',
  'hbar',
  'algo',
  'dot',
  'atom',
  'near',
  'sui',
  'apt',
] as const;

/**
 * Supported testnet coins on BitGo
 */
export const TESTNET_COINS = [
  'tbtc',
  'teth',
  'tltc',
  'txrp',
  'txlm',
  'teos',
  'ttrx',
  'tsol',
  'tavaxc',
  'tpolygon',
  'tarbeth',
  'topeth',
  'tbsc',
] as const;

export type SupportedCoin = (typeof SUPPORTED_COINS)[number];
export type TestnetCoin = (typeof TESTNET_COINS)[number];
export type BitGoCoin = SupportedCoin | TestnetCoin;

/**
 * Coin options for n8n dropdown fields
 */
export const COIN_OPTIONS = [
  // Major coins
  { name: 'Bitcoin (BTC)', value: 'btc' },
  { name: 'Ethereum (ETH)', value: 'eth' },
  { name: 'Litecoin (LTC)', value: 'ltc' },
  { name: 'Ripple (XRP)', value: 'xrp' },
  { name: 'Stellar (XLM)', value: 'xlm' },
  { name: 'EOS', value: 'eos' },
  { name: 'Tron (TRX)', value: 'trx' },
  { name: 'Solana (SOL)', value: 'sol' },
  // Layer 2 & EVM chains
  { name: 'Avalanche C-Chain (AVAXC)', value: 'avaxc' },
  { name: 'Polygon (MATIC)', value: 'polygon' },
  { name: 'Arbitrum (ETH)', value: 'arbeth' },
  { name: 'Optimism (ETH)', value: 'opeth' },
  { name: 'BNB Smart Chain (BSC)', value: 'bsc' },
  // Other chains
  { name: 'Hedera (HBAR)', value: 'hbar' },
  { name: 'Algorand (ALGO)', value: 'algo' },
  { name: 'Polkadot (DOT)', value: 'dot' },
  { name: 'Cosmos (ATOM)', value: 'atom' },
  { name: 'NEAR Protocol', value: 'near' },
  { name: 'Sui', value: 'sui' },
  { name: 'Aptos (APT)', value: 'apt' },
] as const;

/**
 * Testnet coin options for n8n dropdown fields
 */
export const TESTNET_COIN_OPTIONS = [
  { name: 'Bitcoin Testnet (tBTC)', value: 'tbtc' },
  { name: 'Ethereum Testnet (tETH)', value: 'teth' },
  { name: 'Litecoin Testnet (tLTC)', value: 'tltc' },
  { name: 'Ripple Testnet (tXRP)', value: 'txrp' },
  { name: 'Stellar Testnet (tXLM)', value: 'txlm' },
  { name: 'EOS Testnet (tEOS)', value: 'teos' },
  { name: 'Tron Testnet (tTRX)', value: 'ttrx' },
  { name: 'Solana Testnet (tSOL)', value: 'tsol' },
  { name: 'Avalanche C-Chain Testnet', value: 'tavaxc' },
  { name: 'Polygon Testnet', value: 'tpolygon' },
  { name: 'Arbitrum Testnet', value: 'tarbeth' },
  { name: 'Optimism Testnet', value: 'topeth' },
  { name: 'BSC Testnet', value: 'tbsc' },
] as const;

/**
 * Combined coin options (mainnet + testnet)
 */
export const ALL_COIN_OPTIONS = [...COIN_OPTIONS, ...TESTNET_COIN_OPTIONS];

/**
 * Check if a coin is a testnet coin
 */
export function isTestnetCoin(coin: string): boolean {
  return coin.startsWith('t');
}

/**
 * Get the mainnet equivalent of a testnet coin
 */
export function getMainnetCoin(coin: string): string {
  if (isTestnetCoin(coin)) {
    return coin.substring(1);
  }
  return coin;
}

/**
 * Get the testnet equivalent of a mainnet coin
 */
export function getTestnetCoin(coin: string): string {
  if (!isTestnetCoin(coin)) {
    return 't' + coin;
  }
  return coin;
}
