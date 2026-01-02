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
        operation: ['createUnstaking'],
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
        operation: ['createUnstaking'],
      },
    },
    description: 'The amount to unstake in base units',
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
        operation: ['createUnstaking'],
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
        operation: ['createUnstaking'],
      },
    },
    options: [
      {
        displayName: 'Validator',
        name: 'validator',
        type: 'string',
        default: '',
        description: 'The validator address to unstake from',
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
  };

  const body: IDataObject = {
    amount,
    walletPassphrase,
  };

  if (additionalOptions.validator) body.validator = additionalOptions.validator;

  const response = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/staking/unstake`,
    body,
  );

  return this.helpers.returnJsonArray(response as IDataObject);
}
