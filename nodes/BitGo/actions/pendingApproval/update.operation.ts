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
import { NodeOperationError } from 'n8n-workflow';
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
        operation: ['update'],
      },
    },
  },
  {
    displayName: 'State',
    name: 'state',
    type: 'options',
    options: [
      { name: 'Approve', value: 'approved' },
      { name: 'Reject', value: 'rejected' },
    ],
    required: true,
    default: 'approved',
    description: 'Resolution state for the pending approval',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['update'],
      },
    },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Wallet Passphrase',
        name: 'walletPassphrase',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Required when approving transactions',
      },
      {
        displayName: 'OTP',
        name: 'otp',
        type: 'string',
        default: '',
        description: 'One-time password for 2FA',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  _coin?: string,
): Promise<INodeExecutionData[]> {
  const pendingApprovalId = this.getNodeParameter('pendingApprovalId', index) as string;
  const state = this.getNodeParameter('state', index) as string;
  const options = this.getNodeParameter('options', index, {}) as {
    walletPassphrase?: string;
    otp?: string;
  };

  const credentials = await this.getCredentials('bitGoApi');

  const body: IDataObject = {
    state,
  };

  // Get wallet passphrase from options or credentials
  if (state === 'approved') {
    const passphrase = options.walletPassphrase || (credentials.walletPassphrase as string);
    if (!passphrase) {
      throw new NodeOperationError(
        this.getNode(),
        'Wallet passphrase is required when approving. Provide it in options or credentials.',
      );
    }
    body.walletPassphrase = passphrase;
  }

  if (options.otp) {
    body.otp = options.otp;
  }

  const result = await bitgoApiRequest.call(
    this,
    'PUT',
    `/pendingapprovals/${pendingApprovalId}`,
    body,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
