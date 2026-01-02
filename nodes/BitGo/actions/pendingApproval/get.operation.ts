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
import { bitgoApiRequest } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Pending Approval ID',
    name: 'pendingApprovalId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the pending approval',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['get'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  _coin: string,
): Promise<INodeExecutionData[]> {
  const pendingApprovalId = this.getNodeParameter('pendingApprovalId', index) as string;

  const pendingApproval = await bitgoApiRequest.call(
    this,
    'GET',
    `/pendingapprovals/${pendingApprovalId}`,
  );

  return this.helpers.returnJsonArray(pendingApproval as IDataObject);
}
