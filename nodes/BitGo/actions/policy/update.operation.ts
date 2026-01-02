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
        operation: ['update'],
      },
    },
    description: 'The ID of the wallet',
  },
  {
    displayName: 'Policy ID',
    name: 'policyId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['policy'],
        operation: ['update'],
      },
    },
    description: 'The ID of the policy to update',
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['policy'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [
          { name: 'Get Approval', value: 'getApproval' },
          { name: 'Deny', value: 'deny' },
        ],
        default: 'getApproval',
        description: 'Action to take when policy is triggered',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'string',
        default: '',
        description: 'Amount limit for velocity policy',
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
  const policyId = this.getNodeParameter('policyId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

  const body: IDataObject = { ...updateFields };
  if (updateFields.action) {
    body.action = { type: updateFields.action };
    delete body.action;
  }

  const response = await bitgoCoinApiRequest.call(
    this,
    'PUT',
    coin,
    `/wallet/${walletId}/policy/${policyId}`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
