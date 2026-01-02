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
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['get'],
      },
    },
    description: 'The ID of the wallet',
  },
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['get'],
      },
    },
    description: 'The ID of the webhook',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const walletId = this.getNodeParameter('walletId', index) as string;
  const webhookId = this.getNodeParameter('webhookId', index) as string;

  const response = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/wallet/${walletId}/webhooks/${webhookId}`,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
