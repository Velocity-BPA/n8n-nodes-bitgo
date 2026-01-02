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
        operation: ['create'],
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
        operation: ['create'],
      },
    },
    description: 'Type of webhook',
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
        operation: ['create'],
      },
    },
    description: 'URL to receive webhook notifications',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Confirmations',
        name: 'numConfirmations',
        type: 'number',
        default: 0,
        description: 'Number of confirmations before triggering',
      },
      {
        displayName: 'Listen to Failure States',
        name: 'listenToFailureStates',
        type: 'boolean',
        default: false,
        description: 'Whether to trigger on failed transactions',
      },
      {
        displayName: 'All Tokens',
        name: 'allToken',
        type: 'boolean',
        default: false,
        description: 'Whether to receive events for all tokens',
      },
    ],
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
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    type,
    url,
    ...additionalFields,
  };

  const response = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/webhooks`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
