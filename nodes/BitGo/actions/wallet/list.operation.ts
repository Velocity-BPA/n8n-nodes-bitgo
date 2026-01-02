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
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['wallet'],
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
        resource: ['wallet'],
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
        resource: ['wallet'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include token wallets',
      },
      {
        displayName: 'Enterprise ID',
        name: 'enterprise',
        type: 'string',
        default: '',
        description: 'Filter wallets by enterprise ID',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as {
    allTokens?: boolean;
    enterprise?: string;
  };

  const qs: IDataObject = {};

  if (filters.allTokens) {
    qs.allTokens = true;
  }

  if (filters.enterprise) {
    qs.enterprise = filters.enterprise;
  }

  let wallets: IDataObject[];

  if (returnAll) {
    wallets = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      '/wallet',
      {},
      qs,
      undefined,
      'wallets',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    qs.limit = limit;
    const response = await bitgoCoinApiRequest.call(this, 'GET', coin, '/wallet', {}, qs);
    wallets = ((response as IDataObject).wallets as IDataObject[]) || [];
  }

  return this.helpers.returnJsonArray(wallets);
}
