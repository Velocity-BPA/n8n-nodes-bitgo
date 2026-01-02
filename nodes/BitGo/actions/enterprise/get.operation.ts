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
import { bitgoApiRequest } from '../../transport/requestWithAuth';

export const description: INodeProperties[] = [
  {
    displayName: 'Enterprise ID',
    name: 'enterpriseId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['enterprise'],
        operation: ['get'],
      },
    },
    description: 'The ID of the enterprise to retrieve',
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;

  const response = await bitgoApiRequest.call(this, 'GET', `/enterprise/${enterpriseId}`);

  return this.helpers.returnJsonArray(response as IDataObject);
}
