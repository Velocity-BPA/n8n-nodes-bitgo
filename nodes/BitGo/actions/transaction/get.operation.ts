/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  IDataObject,
} from 'n8n-workflow';
import { bitgoCoinApiRequest } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Transaction ID',
    name: 'txId',
    type: 'string',
    required: true,
    default: '',
    description: 'The transaction ID (txid or internal ID)',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['get'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const walletId = this.getNodeParameter('walletId', index) as string;
  const txId = this.getNodeParameter('txId', index) as string;

  const transaction = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/wallet/${walletId}/tx/${txId}`,
  );

  return this.helpers.returnJsonArray(transaction as IDataObject);
}
