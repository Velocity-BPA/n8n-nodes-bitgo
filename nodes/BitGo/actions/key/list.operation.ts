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
        resource: ['key'],
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
        resource: ['key'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;

  let keys: IDataObject[];

  if (returnAll) {
    keys = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      '/key',
      {},
      {},
      undefined,
      'keys',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    const response = await bitgoCoinApiRequest.call(this, 'GET', coin, '/key', {}, { limit });
    keys = ((response as IDataObject).keys as IDataObject[]) || [];
  }

  return this.helpers.returnJsonArray(keys);
}
