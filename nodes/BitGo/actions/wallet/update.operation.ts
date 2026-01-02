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
    description: 'The ID of the wallet to update',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['update'],
      },
    },
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        description: 'New label for the wallet',
      },
      {
        displayName: 'Approvals Required',
        name: 'approvalsRequired',
        type: 'number',
        default: 1,
        description: 'Number of approvals required for transactions',
      },
      {
        displayName: 'Disable Transaction Notifications',
        name: 'disableTransactionNotifications',
        type: 'boolean',
        default: false,
        description: 'Whether to disable email notifications',
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
  const updateFields = this.getNodeParameter('updateFields', index, {}) as {
    label?: string;
    approvalsRequired?: number;
    disableTransactionNotifications?: boolean;
  };

  const body: Record<string, string | number | boolean> = {};

  if (updateFields.label) {
    body.label = updateFields.label;
  }

  if (updateFields.approvalsRequired !== undefined) {
    body.approvalsRequired = updateFields.approvalsRequired;
  }

  if (updateFields.disableTransactionNotifications !== undefined) {
    body.disableTransactionNotifications = updateFields.disableTransactionNotifications;
  }

  const wallet = await bitgoCoinApiRequest.call(this, 'PUT', coin, `/wallet/${walletId}`, body);

  return this.helpers.returnJsonArray(wallet as IDataObject);
}
