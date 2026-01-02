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
        operation: ['delete'],
      },
    },
    description: 'The ID of the wallet',
  },
  {
    displayName: 'Webhook Type',
    name: 'type',
    type: 'options',
    options: [
      { name: 'Transfer', value: 'transfer' },
      { name: 'Transaction', value: 'transaction' },
      { name: 'Pending Approval', value: 'pendingapproval' },
      { name: 'Address Confirmation', value: 'address_confirmation' },
      { name: 'Block', value: 'block' },
      { name: 'Wallet Confirmation', value: 'wallet_confirmation' },
    ],
    default: 'transfer',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['delete'],
      },
    },
    description: 'Type of webhook to delete',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['delete'],
      },
    },
    description: 'URL of the webhook to delete',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const walletId = this.getNodeParameter('walletId', index) as string;
  const type = this.getNodeParameter('type', index) as string;
  const url = this.getNodeParameter('url', index) as string;

  const body: IDataObject = { type, url };

  const response = await bitgoCoinApiRequest.call(
    this,
    'DELETE',
    coin,
    `/wallet/${walletId}/webhooks`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
