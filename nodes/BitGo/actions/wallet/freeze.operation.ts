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
    description: 'The ID of the wallet to freeze',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['freeze'],
      },
    },
  },
  {
    displayName: 'Duration (Seconds)',
    name: 'duration',
    type: 'number',
    required: true,
    default: 86400,
    description: 'Duration of freeze in seconds (default: 24 hours)',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['freeze'],
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
  const duration = this.getNodeParameter('duration', index) as number;

  const body = {
    duration,
  };

  const result = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/freeze`,
    body,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
