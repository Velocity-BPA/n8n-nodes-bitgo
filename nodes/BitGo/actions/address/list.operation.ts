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
        resource: ['address'],
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
        resource: ['address'],
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
        resource: ['address'],
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
        resource: ['address'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Chain',
        name: 'chain',
        type: 'number',
        default: 0,
        description: 'Filter by chain (0=external, 1=internal/change)',
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        options: [
          { name: 'Ascending', value: 1 },
          { name: 'Descending', value: -1 },
        ],
        default: -1,
        description: 'Sort order by address index',
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
    chain?: number;
    sort?: number;
  };

  const qs: IDataObject = {};

  if (filters.chain !== undefined) {
    qs.chain = filters.chain;
  }

  if (filters.sort !== undefined) {
    qs.sort = filters.sort;
  }

  let addresses: IDataObject[];

  if (returnAll) {
    addresses = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/addresses`,
      {},
      qs,
      undefined,
      'addresses',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    qs.limit = limit;
    const response = await bitgoCoinApiRequest.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/addresses`,
      {},
      qs,
    );
    addresses = ((response as IDataObject).addresses as IDataObject[]) || [];
  }

  return this.helpers.returnJsonArray(addresses);
}
