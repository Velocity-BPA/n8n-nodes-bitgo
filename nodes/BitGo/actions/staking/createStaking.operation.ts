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
import { bitgoCoinApiRequest, validateWalletPassphrase } from '../../transport/requestWithAuth';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['createStaking'],
      },
    },
    description: 'The ID of the wallet',
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['createStaking'],
      },
    },
    description: 'The amount to stake in base units (e.g., wei for ETH)',
  },
  {
    displayName: 'Wallet Passphrase',
    name: 'walletPassphrase',
    type: 'string',
    typeOptions: {
      password: true,
    },
    default: '',
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['createStaking'],
      },
    },
    description: 'Wallet passphrase for signing (leave empty to use credential passphrase)',
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['staking'],
        operation: ['createStaking'],
      },
    },
    options: [
      {
        displayName: 'Validator',
        name: 'validator',
        type: 'string',
        default: '',
        description: 'The validator address to stake with',
      },
      {
        displayName: 'Duration (Days)',
        name: 'duration',
        type: 'number',
        default: 0,
        description: 'Lock-up duration in days (if applicable)',
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
  const amount = this.getNodeParameter('amount', index) as string;
  const walletPassphrase = await validateWalletPassphrase.call(this, index);
  const additionalOptions = this.getNodeParameter('additionalOptions', index) as {
    validator?: string;
    duration?: number;
  };

  const body: IDataObject = {
    amount,
    walletPassphrase,
  };

  if (additionalOptions.validator) body.validator = additionalOptions.validator;
  if (additionalOptions.duration) body.duration = additionalOptions.duration;

  const response = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/staking/stake`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
