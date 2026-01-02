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
        operation: ['simulate'],
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
    ],
    default: 'transfer',
    required: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['simulate'],
      },
    },
    description: 'Type of webhook to simulate',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const walletId = this.getNodeParameter('walletId', index) as string;
  const type = this.getNodeParameter('type', index) as string;

  const body: IDataObject = { webhookId: type };

  const response = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/webhooks/simulate`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
