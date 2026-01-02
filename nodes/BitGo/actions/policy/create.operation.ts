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
        resource: ['policy'],
        operation: ['create'],
      },
    },
    description: 'The ID of the wallet to add a policy to',
  },
  {
    displayName: 'Policy Type',
    name: 'policyType',
    type: 'options',
    options: [
      { name: 'Velocity Limit', value: 'velocityLimit' },
      { name: 'Coin Address Whitelist', value: 'coinAddressWhitelist' },
      { name: 'Webhook', value: 'webhook' },
      { name: 'Advanced Whitelist', value: 'advancedWhitelist' },
    ],
    default: 'velocityLimit',
    required: true,
    displayOptions: {
      show: {
        resource: ['policy'],
        operation: ['create'],
      },
    },
    description: 'The type of policy to create',
  },
  {
    displayName: 'Policy Action',
    name: 'action',
    type: 'options',
    options: [
      { name: 'Get Approval', value: 'getApproval' },
      { name: 'Deny', value: 'deny' },
    ],
    default: 'getApproval',
    required: true,
    displayOptions: {
      show: {
        resource: ['policy'],
        operation: ['create'],
      },
    },
    description: 'Action to take when policy is triggered',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['policy'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Velocity Limit Amount',
        name: 'amount',
        type: 'string',
        default: '',
        description: 'Amount limit for velocity policy (in base units)',
      },
      {
        displayName: 'Time Window (Hours)',
        name: 'timeWindow',
        type: 'number',
        default: 24,
        description: 'Time window for velocity limit in hours',
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
  const policyType = this.getNodeParameter('policyType', index) as string;
  const action = this.getNodeParameter('action', index) as string;
  const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

  const body: IDataObject = {
    type: policyType,
    action: { type: action },
    ...additionalFields,
  };

  const response = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/policy`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
