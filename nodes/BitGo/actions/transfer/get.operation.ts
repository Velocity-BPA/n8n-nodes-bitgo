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
        resource: ['transfer'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Transfer ID',
    name: 'transferId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the transfer',
    displayOptions: {
      show: {
        resource: ['transfer'],
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
  const transferId = this.getNodeParameter('transferId', index) as string;

  const transfer = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/wallet/${walletId}/transfer/${transferId}`,
  );

  return this.helpers.returnJsonArray(transfer as IDataObject);
}
