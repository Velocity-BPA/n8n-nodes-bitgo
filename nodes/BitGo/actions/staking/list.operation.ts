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
      { name: 'Ethereum (ETH)', value: 'eth' },
      { name: 'Ethereum Testnet (TETH)', value: 'teth' },
      { name: 'Solana (SOL)', value: 'sol' },
      { name: 'Solana Testnet (TSOL)', value: 'tsol' },
      { name: 'Cosmos (ATOM)', value: 'atom' },
      { name: 'Polkadot (DOT)', value: 'dot' },
      { name: 'NEAR (NEAR)', value: 'near' },
      { name: 'Sui (SUI)', value: 'sui' },
      { name: 'Aptos (APT)', value: 'apt' },
    ],
    default: 'eth',
    required: true,
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['list'],
      },
    },
    description: 'The cryptocurrency coin type that supports staking',
  },
  {
    displayName: 'Enterprise ID',
    name: 'enterpriseId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['list'],
      },
    },
    description: 'The ID of the enterprise',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin?: string,
): Promise<INodeExecutionData[]> {
  const coinType = coin || (this.getNodeParameter('coin', index) as string);
  const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;

  const response = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coinType,
    `/enterprise/${enterpriseId}/staking/wallets`,
  );

  const wallets = (response as { wallets?: IDataObject[] }).wallets || response;
  return this.helpers.returnJsonArray(wallets as IDataObject[]);
}
