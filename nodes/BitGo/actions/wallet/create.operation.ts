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
    displayName: 'Label',
    name: 'label',
    type: 'string',
    required: true,
    default: '',
    description: 'Label for the new wallet',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Passphrase',
    name: 'passphrase',
    type: 'string',
    typeOptions: {
      password: true,
    },
    required: true,
    default: '',
    description: 'Passphrase for encrypting the wallet key',
    displayOptions: {
      show: {
        resource: ['wallet'],
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
        resource: ['wallet'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Enterprise ID',
        name: 'enterprise',
        type: 'string',
        default: '',
        description: 'Enterprise ID to associate with the wallet',
      },
      {
        displayName: 'Wallet Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'Hot Wallet', value: 'hot' },
          { name: 'Cold Wallet', value: 'cold' },
          { name: 'Custodial Wallet', value: 'custodial' },
        ],
        default: 'hot',
        description: 'Type of wallet to create',
      },
      {
        displayName: 'Disable Transaction Notifications',
        name: 'disableTransactionNotifications',
        type: 'boolean',
        default: false,
        description: 'Whether to disable email notifications for transactions',
      },
      {
        displayName: 'User Key',
        name: 'userKey',
        type: 'string',
        default: '',
        description: 'Provide an existing user key public key (xpub)',
      },
      {
        displayName: 'Backup Key',
        name: 'backupXpub',
        type: 'string',
        default: '',
        description: 'Provide an existing backup key public key (xpub)',
      },
      {
        displayName: 'M (Signatures Required)',
        name: 'm',
        type: 'number',
        default: 2,
        description: 'Number of signatures required for transactions',
      },
      {
        displayName: 'N (Total Keys)',
        name: 'n',
        type: 'number',
        default: 3,
        description: 'Total number of keys in the wallet',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const label = this.getNodeParameter('label', index) as string;
  const passphrase = this.getNodeParameter('passphrase', index) as string;
  const options = this.getNodeParameter('options', index, {}) as {
    enterprise?: string;
    type?: 'hot' | 'cold' | 'custodial';
    disableTransactionNotifications?: boolean;
    userKey?: string;
    backupXpub?: string;
    m?: number;
    n?: number;
  };

  const credentials = await this.getCredentials('bitGoApi');

  const body: IDataObject = {
    label,
    passphrase,
  };

  if (options.enterprise) {
    body.enterprise = options.enterprise;
  } else if (credentials.enterpriseId) {
    body.enterprise = credentials.enterpriseId as string;
  }

  if (options.type) {
    body.type = options.type;
  }

  if (options.disableTransactionNotifications) {
    body.disableTransactionNotifications = true;
  }

  if (options.userKey) {
    body.userKey = options.userKey;
  }

  if (options.backupXpub) {
    body.backupXpub = options.backupXpub;
  }

  if (options.m) {
    body.m = options.m;
  }

  if (options.n) {
    body.n = options.n;
  }

  const wallet = await bitgoCoinApiRequest.call(this, 'POST', coin, '/wallet/generate', body);

  return this.helpers.returnJsonArray(wallet as IDataObject);
}
