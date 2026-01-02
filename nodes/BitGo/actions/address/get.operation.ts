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
        resource: ['address'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Address or ID',
    name: 'addressOrId',
    type: 'string',
    required: true,
    default: '',
    description: 'The address string or address ID',
    displayOptions: {
      show: {
        resource: ['address'],
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
  const addressOrId = this.getNodeParameter('addressOrId', index) as string;

  const address = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/wallet/${walletId}/address/${encodeURIComponent(addressOrId)}`,
  );

  return this.helpers.returnJsonArray(address as IDataObject);
}
