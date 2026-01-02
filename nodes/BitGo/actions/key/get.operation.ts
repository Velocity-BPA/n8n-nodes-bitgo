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
    displayName: 'Key ID',
    name: 'keyId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the key',
    displayOptions: {
      show: {
        resource: ['key'],
        operation: ['get'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const keyId = this.getNodeParameter('keyId', index) as string;

  const key = await bitgoCoinApiRequest.call(this, 'GET', coin, `/key/${keyId}`);

  return this.helpers.returnJsonArray(key as IDataObject);
}
