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
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    description: 'The address to verify',
    displayOptions: {
      show: {
        resource: ['address'],
        operation: ['verify'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const address = this.getNodeParameter('address', index) as string;

  const result = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/verifyaddress`,
    {},
    { address },
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
