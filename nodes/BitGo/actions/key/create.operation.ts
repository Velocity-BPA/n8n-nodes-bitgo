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
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['key'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Source',
        name: 'source',
        type: 'options',
        options: [
          { name: 'User Key', value: 'user' },
          { name: 'Backup Key', value: 'backup' },
          { name: 'BitGo Key', value: 'bitgo' },
        ],
        default: 'user',
        description: 'The source/type of key',
      },
      {
        displayName: 'Public Key',
        name: 'pub',
        type: 'string',
        default: '',
        description: 'Existing public key to import',
      },
      {
        displayName: 'Encrypted Private Key',
        name: 'encryptedPrv',
        type: 'string',
        default: '',
        description: 'Encrypted private key to store',
      },
      {
        displayName: 'Enterprise ID',
        name: 'enterprise',
        type: 'string',
        default: '',
        description: 'Enterprise ID to associate the key with',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const options = this.getNodeParameter('options', index, {}) as {
    source?: string;
    pub?: string;
    encryptedPrv?: string;
    enterprise?: string;
  };

  const body: Record<string, string> = {};

  if (options.source) {
    body.source = options.source;
  }

  if (options.pub) {
    body.pub = options.pub;
  }

  if (options.encryptedPrv) {
    body.encryptedPrv = options.encryptedPrv;
  }

  if (options.enterprise) {
    body.enterprise = options.enterprise;
  }

  const key = await bitgoCoinApiRequest.call(this, 'POST', coin, '/key', body);

  return this.helpers.returnJsonArray(key as IDataObject);
}
