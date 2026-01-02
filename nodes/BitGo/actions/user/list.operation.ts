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
        resource: ['user'],
        operation: ['list'],
      },
    },
    description: 'The ID of the enterprise to list users for',
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 500,
        },
        default: 25,
        description: 'Maximum number of users to return',
      },
      {
        displayName: 'Previous ID',
        name: 'prevId',
        type: 'string',
        default: '',
        description: 'The ID of the last user from previous page for pagination',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;
  const additionalOptions = this.getNodeParameter('additionalOptions', index) as {
    limit?: number;
    prevId?: string;
  };

  const qs: IDataObject = {};
  if (additionalOptions.limit) qs.limit = additionalOptions.limit;
  if (additionalOptions.prevId) qs.prevId = additionalOptions.prevId;

  const response = await bitgoApiRequest.call(
    this,
    'GET',
    `/enterprise/${enterpriseId}/user`,
    undefined,
    qs,
  );

  const users = (response as { users?: object[] }).users || response;
  return this.helpers.returnJsonArray(users as IDataObject[]);
}
