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
        resource: ['address'],
        operation: ['create'],
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
        resource: ['address'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Label',
        name: 'label',
        type: 'string',
        default: '',
        description: 'Label for the new address',
      },
      {
        displayName: 'Chain',
        name: 'chain',
        type: 'number',
        default: 0,
        description: 'Chain to generate address on (0=external, 1=internal)',
      },
      {
        displayName: 'Gas Price',
        name: 'gasPrice',
        type: 'number',
        default: 0,
        description: 'Gas price for address creation (ETH-based coins)',
      },
      {
        displayName: 'Forwarder Version',
        name: 'forwarderVersion',
        type: 'number',
        default: 0,
        description: 'Forwarder contract version (ETH-based coins)',
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
    label?: string;
    chain?: number;
    gasPrice?: number;
    forwarderVersion?: number;
  };

  const body: Record<string, string | number> = {};

  if (options.label) {
    body.label = options.label;
  }

  if (options.chain !== undefined) {
    body.chain = options.chain;
  }

  if (options.gasPrice && options.gasPrice > 0) {
    body.gasPrice = options.gasPrice;
  }

  if (options.forwarderVersion && options.forwarderVersion > 0) {
    body.forwarderVersion = options.forwarderVersion;
  }

  const address = await bitgoCoinApiRequest.call(
    this,
    'POST',
    coin,
    `/wallet/${walletId}/address`,
    body,
  );

  return this.helpers.returnJsonArray(address as IDataObject);
}
