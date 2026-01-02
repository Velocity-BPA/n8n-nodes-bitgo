/**
 * n8n-nodes-bitgo
 * Copyright (c) 2025 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  IDataObject,
} from 'n8n-workflow';
import { bitgoApiRequest } from '../../transport/requestWithAuth';

export const description: INodeProperties[] = [
  {
    displayName: 'Coin',
    name: 'coin',
    type: 'options',
    options: [
      { name: 'Bitcoin (BTC)', value: 'btc' },
      { name: 'Bitcoin Testnet (TBTC)', value: 'tbtc' },
      { name: 'Ethereum (ETH)', value: 'eth' },
      { name: 'Ethereum Testnet (TETH)', value: 'teth' },
      { name: 'Litecoin (LTC)', value: 'ltc' },
      { name: 'XRP (XRP)', value: 'xrp' },
      { name: 'Stellar (XLM)', value: 'xlm' },
      { name: 'Solana (SOL)', value: 'sol' },
      { name: 'Polygon (POLYGON)', value: 'polygon' },
      { name: 'Avalanche C-Chain (AVAXC)', value: 'avaxc' },
      { name: 'Arbitrum (ARBETH)', value: 'arbeth' },
      { name: 'Optimism (OPETH)', value: 'opeth' },
      { name: 'BSC (BSC)', value: 'bsc' },
      { name: 'Hedera (HBAR)', value: 'hbar' },
      { name: 'Algorand (ALGO)', value: 'algo' },
      { name: 'Polkadot (DOT)', value: 'dot' },
      { name: 'Cosmos (ATOM)', value: 'atom' },
      { name: 'NEAR (NEAR)', value: 'near' },
      { name: 'Sui (SUI)', value: 'sui' },
      { name: 'Aptos (APT)', value: 'apt' },
    ],
    default: 'btc',
    required: true,
    displayOptions: {
      show: {
        resource: ['coin'],
        operation: ['get'],
      },
    },
    description: 'The cryptocurrency coin type',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const coin = this.getNodeParameter('coin', index) as string;

  const response = await bitgoApiRequest.call(this, 'GET', `/market/latest`);

  const marketData = response as IDataObject;
  const coinData = marketData[coin] || marketData[coin.toUpperCase()];

  return this.helpers.returnJsonArray({ coin, ...((coinData as object) || {}) });
}
