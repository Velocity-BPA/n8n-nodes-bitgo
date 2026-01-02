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
import { bitgoCoinApiRequest, bitgoCoinApiRequestAllItems } from '../../transport';

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
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['transfer'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['transfer'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['transfer'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'State',
        name: 'state',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Confirmed', value: 'confirmed' },
          { name: 'Pending', value: 'pendingApproval' },
          { name: 'Failed', value: 'failed' },
        ],
        default: '',
        description: 'Filter by transfer state',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Send', value: 'send' },
          { name: 'Receive', value: 'receive' },
        ],
        default: '',
        description: 'Filter by transfer type',
      },
      {
        displayName: 'All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include token transfers',
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
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as {
    state?: string;
    type?: string;
    allTokens?: boolean;
  };

  const qs: Record<string, string | boolean | number> = {};

  if (filters.state) {
    qs.state = filters.state;
  }

  if (filters.type) {
    qs.type = filters.type;
  }

  if (filters.allTokens) {
    qs.allTokens = true;
  }

  let transfers;

  if (returnAll) {
    transfers = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/transfer`,
      {},
      qs,
      undefined,
      'transfers',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    qs.limit = limit;
    const response = await bitgoCoinApiRequest.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/transfer`,
      {},
      qs,
    );
    transfers = (response as { transfers?: IDataObject[] }).transfers || [];
  }

  return this.helpers.returnJsonArray(transfers as IDataObject[]);
}
