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
import { bitgoCoinApiRequest } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['getMaxSpendable'],
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
        operation: ['getMaxSpendable'],
      },
    },
    options: [
      {
        displayName: 'Min Confirmations',
        name: 'minConfirms',
        type: 'number',
        default: 1,
        description: 'Minimum confirmations for inputs',
      },
      {
        displayName: 'Fee Rate',
        name: 'feeRate',
        type: 'number',
        default: 0,
        description: 'Custom fee rate',
      },
      {
        displayName: 'Max Fee Rate',
        name: 'maxFeeRate',
        type: 'number',
        default: 0,
        description: 'Maximum fee rate',
      },
      {
        displayName: 'Enforce Min Confirms For Change',
        name: 'enforceMinConfirmsForChange',
        type: 'boolean',
        default: false,
        description: 'Whether to apply min confirmations to change outputs',
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
  const options = this.getNodeParameter('options', index, {}) as {
    minConfirms?: number;
    feeRate?: number;
    maxFeeRate?: number;
    enforceMinConfirmsForChange?: boolean;
  };

  const qs: Record<string, number | boolean> = {};

  if (options.minConfirms !== undefined) {
    qs.minConfirms = options.minConfirms;
  }

  if (options.feeRate && options.feeRate > 0) {
    qs.feeRate = options.feeRate;
  }

  if (options.maxFeeRate && options.maxFeeRate > 0) {
    qs.maxFeeRate = options.maxFeeRate;
  }

  if (options.enforceMinConfirmsForChange) {
    qs.enforceMinConfirmsForChange = true;
  }

  const result = await bitgoCoinApiRequest.call(
    this,
    'GET',
    coin,
    `/wallet/${walletId}/maximumSpendable`,
    {},
    qs,
  );

  return this.helpers.returnJsonArray(result as IDataObject);
}
