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
        operation: ['update'],
      },
    },
    description: 'The ID of the enterprise to update',
  },
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['enterprise'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'The enterprise name',
      },
      {
        displayName: 'Emergency Phone',
        name: 'emergencyPhone',
        type: 'string',
        default: '',
        description: 'Emergency contact phone number',
      },
      {
        displayName: 'App Approvals Enabled',
        name: 'approvalsRequired',
        type: 'number',
        default: 1,
        description: 'Number of approvals required for operations',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;
  const updateFields = this.getNodeParameter('updateFields', index) as {
    name?: string;
    emergencyPhone?: string;
    approvalsRequired?: number;
  };

  const body: IDataObject = {};
  if (updateFields.name) body.name = updateFields.name;
  if (updateFields.emergencyPhone) body.emergencyPhone = updateFields.emergencyPhone;
  if (updateFields.approvalsRequired !== undefined) {
    body.approvalsRequired = updateFields.approvalsRequired;
  }

  const response = await bitgoApiRequest.call(this, 'PUT', `/enterprise/${enterpriseId}`, body);

  return this.helpers.returnJsonArray(response as IDataObject);
}
