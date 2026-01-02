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
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['update'],
      },
    },
    description: 'The ID of the user to update',
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['user'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: "The user's name",
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: "The user's phone number",
      },
      {
        displayName: 'OTP Enabled',
        name: 'otpEnabled',
        type: 'boolean',
        default: true,
        description: 'Whether OTP is enabled for the user',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const userId = this.getNodeParameter('userId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index) as {
    name?: string;
    phone?: string;
    otpEnabled?: boolean;
  };

  const body: IDataObject = {};
  if (updateFields.name) body.name = updateFields.name;
  if (updateFields.phone) body.phone = updateFields.phone;
  if (updateFields.otpEnabled !== undefined) body.otpEnabled = updateFields.otpEnabled;

  const response = await bitgoApiRequest.call(this, 'PUT', `/user/${userId}`, body);

  return this.helpers.returnJsonArray(response as IDataObject);
}
