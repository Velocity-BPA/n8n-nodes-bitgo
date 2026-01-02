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
import { bitgoCoinApiRequest } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet to sweep',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sweep'],
      },
    },
  },
  {
    displayName: 'Destination Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    description: 'The address to sweep all funds to',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sweep'],
      },
    },
  },
  {
    displayName: 'Wallet Passphrase',
    name: 'walletPassphrase',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    description: 'Wallet passphrase for signing',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sweep'],
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
        resource: ['wallet'],
        operation: ['sweep'],
      },
    },
    options: [
      {
        displayName: 'Fee Rate',
        name: 'feeRate',
        type: 'number',
        default: 0,
        description: 'Custom fee rate',
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
  coin: string,
): Promise<INodeExecutionData[]> {
  const walletId = this.getNodeParameter('walletId', index) as string;
  const address = this.getNodeParameter('address', index) as string;
  const walletPassphrase = this.getNodeParameter('walletPassphrase', index, '') as string;
  const options = this.getNodeParameter('options', index, {}) as {
    feeRate?: number;
    otp?: string;
  };

  const credentials = await this.getCredentials('bitGoApi');
  const passphrase = walletPassphrase || (credentials.walletPassphrase as string);

  if (!passphrase) {
    throw new NodeOperationError(
      this.getNode(),
      'Wallet passphrase is required. Provide it in the operation or credentials.',
    );
  }

  const body: IDataObject = {
    address,
    walletPassphrase: passphrase,
  };

  if (options.feeRate && options.feeRate > 0) {
    body.feeRate = options.feeRate;
  }

  if (options.otp) {
    body.otp = options.otp;
  }

  const result = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/sweep`,
    body,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
