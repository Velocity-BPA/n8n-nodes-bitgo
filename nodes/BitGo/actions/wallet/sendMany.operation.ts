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
import { bitgoCoinApiRequest, formatAmount } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet to send from',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sendMany'],
      },
    },
  },
  {
    displayName: 'Recipients',
    name: 'recipients',
    type: 'fixedCollection',
    typeOptions: {
      multipleValues: true,
    },
    required: true,
    default: { recipientValues: [] },
    description: 'Recipients and amounts',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sendMany'],
      },
    },
    options: [
      {
        displayName: 'Recipient',
        name: 'recipientValues',
        values: [
          {
            displayName: 'Address',
            name: 'address',
            type: 'string',
            required: true,
            default: '',
            description: 'Recipient address',
          },
          {
            displayName: 'Amount',
            name: 'amount',
            type: 'string',
            required: true,
            default: '',
            description: 'Amount in base units',
          },
        ],
      },
    ],
  },
  {
    displayName: 'Wallet Passphrase',
    name: 'walletPassphrase',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    description: 'Wallet passphrase for signing. Leave empty to use passphrase from credentials.',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['sendMany'],
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
        operation: ['sendMany'],
      },
    },
    options: [
      {
        displayName: 'Comment',
        name: 'comment',
        type: 'string',
        default: '',
        description: 'Comment/memo for the transaction',
      },
      {
        displayName: 'Sequence ID',
        name: 'sequenceId',
        type: 'string',
        default: '',
        description: 'External ID for idempotency',
      },
      {
        displayName: 'Fee Rate',
        name: 'feeRate',
        type: 'number',
        default: 0,
        description: 'Custom fee rate',
      },
      {
        displayName: 'Min Confirmations',
        name: 'minConfirms',
        type: 'number',
        default: 1,
        description: 'Minimum confirmations for inputs',
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
  const recipientsData = this.getNodeParameter('recipients', index) as {
    recipientValues: Array<{ address: string; amount: string }>;
  };
  const walletPassphrase = this.getNodeParameter('walletPassphrase', index, '') as string;
  const options = this.getNodeParameter('options', index, {}) as {
    comment?: string;
    sequenceId?: string;
    feeRate?: number;
    minConfirms?: number;
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

  const recipients = recipientsData.recipientValues.map((r) => ({
    address: r.address,
    amount: formatAmount(r.amount),
  }));

  const body: IDataObject = {
    recipients,
    walletPassphrase: passphrase,
  };

  if (options.comment) {
    body.comment = options.comment;
  }

  if (options.sequenceId) {
    body.sequenceId = options.sequenceId;
  }

  if (options.feeRate && options.feeRate > 0) {
    body.feeRate = options.feeRate;
  }

  if (options.minConfirms !== undefined) {
    body.minConfirms = options.minConfirms;
  }

  if (options.otp) {
    body.otp = options.otp;
  }

  const result = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/sendmany`,
    body,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
