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
    description: 'The ID of the wallet to retrieve',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['get'],
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
        operation: ['get'],
      },
    },
    options: [
      {
        displayName: 'All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include token balances',
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
    allTokens?: boolean;
  };

  const qs: Record<string, boolean> = {};

  if (options.allTokens) {
    qs.allTokens = true;
  }

  const wallet = await bitgoCoinApiRequest.call(this, 'GET', coin, `/wallet/${walletId}`, {}, qs);

  return this.helpers.returnJsonArray(wallet as IDataObject);
}
