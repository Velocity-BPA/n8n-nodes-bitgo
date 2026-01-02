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
        resource: ['transaction'],
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
        resource: ['transaction'],
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
        resource: ['transaction'],
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
        resource: ['transaction'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include token transactions',
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
    allTokens?: boolean;
  };

  const qs: Record<string, boolean | number> = {};

  if (filters.allTokens) {
    qs.allTokens = true;
  }

  let transactions;

  if (returnAll) {
    transactions = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/tx`,
      {},
      qs,
      undefined,
      'transactions',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    qs.limit = limit;
    const response = await bitgoCoinApiRequest.call(
      this,
      'GET',
      coin,
      `/wallet/${walletId}/tx`,
      {},
      qs,
    );
    transactions = (response as { transactions?: IDataObject[] }).transactions || [];
  }

  return this.helpers.returnJsonArray(transactions as IDataObject[]);
}
