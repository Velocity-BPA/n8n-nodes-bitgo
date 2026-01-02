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
        operation: ['send'],
      },
    },
  },
  {
    displayName: 'Recipient Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    description: 'The destination address to send to',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['send'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    description: 'Amount to send in base units (satoshis for BTC, wei for ETH)',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['send'],
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
    description: 'Wallet passphrase for signing. Leave empty to use passphrase from credentials.',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['send'],
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
        operation: ['send'],
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
        description: 'External ID for idempotency and tracking',
      },
      {
        displayName: 'Fee Rate',
        name: 'feeRate',
        type: 'number',
        default: 0,
        description: 'Custom fee rate (satoshis per KB for BTC)',
      },
      {
        displayName: 'Min Confirmations',
        name: 'minConfirms',
        type: 'number',
        default: 1,
        description: 'Minimum confirmations for inputs',
      },
      {
        displayName: 'Instant',
        name: 'instant',
        type: 'boolean',
        default: false,
        description: 'Whether to use instant send if available',
      },
      {
        displayName: 'OTP',
        name: 'otp',
        type: 'string',
        default: '',
        description: 'One-time password for 2FA if required',
      },
      {
        displayName: 'Max Fee Rate',
        name: 'maxFeeRate',
        type: 'number',
        default: 0,
        description: 'Maximum fee rate allowed',
      },
      {
        displayName: 'No Split Change',
        name: 'noSplitChange',
        type: 'boolean',
        default: false,
        description: 'Whether to prevent splitting change output',
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
  const amount = this.getNodeParameter('amount', index) as string;
  const walletPassphrase = this.getNodeParameter('walletPassphrase', index, '') as string;
  const options = this.getNodeParameter('options', index, {}) as {
    comment?: string;
    sequenceId?: string;
    feeRate?: number;
    minConfirms?: number;
    instant?: boolean;
    otp?: string;
    maxFeeRate?: number;
    noSplitChange?: boolean;
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
    amount: formatAmount(amount),
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

  if (options.instant) {
    body.instant = true;
  }

  if (options.otp) {
    body.otp = options.otp;
  }

  if (options.maxFeeRate && options.maxFeeRate > 0) {
    body.maxFeeRate = options.maxFeeRate;
  }

  if (options.noSplitChange) {
    body.noSplitChange = true;
  }

  const result = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/sendcoins`,
    body,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
