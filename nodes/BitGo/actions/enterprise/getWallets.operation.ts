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
import { bitgoCoinApiRequest } from '../../transport/requestWithAuth';

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
    ],
    default: 'btc',
    required: true,
    displayOptions: {
      show: {
        resource: ['enterprise'],
        operation: ['getWallets'],
      },
    },
    description: 'The cryptocurrency coin type',
  },
  {
    displayName: 'Enterprise ID',
    name: 'enterpriseId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['enterprise'],
        operation: ['getWallets'],
      },
    },
    description: 'The ID of the enterprise',
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['enterprise'],
        operation: ['getWallets'],
      },
    },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 500,
        },
        default: 25,
        description: 'Maximum number of wallets to return',
      },
      {
        displayName: 'Previous ID',
        name: 'prevId',
        type: 'string',
        default: '',
        description: 'The ID of the last wallet from previous page for pagination',
      },
      {
        displayName: 'Get All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include all token wallets',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const coin = this.getNodeParameter('coin', index) as string;
  const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;
  const additionalOptions = this.getNodeParameter('additionalOptions', index) as {
    limit?: number;
    prevId?: string;
    allTokens?: boolean;
  };

  const qs: IDataObject = {
    enterprise: enterpriseId,
  };
  if (additionalOptions.limit) qs.limit = additionalOptions.limit;
  if (additionalOptions.prevId) qs.prevId = additionalOptions.prevId;
  if (additionalOptions.allTokens) qs.allTokens = additionalOptions.allTokens;

  const response = await bitgoCoinApiRequest.call(this, 'GET', '/wallet', coin, undefined, qs);

  const wallets = (response as { wallets?: object[] }).wallets || response;
  return this.helpers.returnJsonArray(wallets as IDataObject[]);
}
