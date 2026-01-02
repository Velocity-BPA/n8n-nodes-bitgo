/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * BitGo API Credentials
 *
 * Provides authentication for BitGo's institutional digital asset custody platform.
 * Supports both production and test environments with Bearer token authentication.
 */
export class BitGoApi implements ICredentialType {
  name = 'bitGoApi';
  displayName = 'BitGo API';
  documentationUrl = 'https://developers.bitgo.com/api/v2';

  properties: INodeProperties[] = [
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description:
        'Long-lived API access token from BitGo dashboard. Generate at Settings > Developer Options.',
    },
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
          description: 'Live environment for real transactions',
        },
        {
          name: 'Test',
          value: 'test',
          description: 'Testnet environment for development and testing',
        },
      ],
      default: 'test',
      required: true,
      description: 'Select the BitGo environment to connect to',
    },
    {
      displayName: 'Enterprise ID',
      name: 'enterpriseId',
      type: 'string',
      default: '',
      description:
        'Enterprise identifier for organization-level operations (optional). Found in Enterprise Settings.',
    },
    {
      displayName: 'Default Wallet Passphrase',
      name: 'walletPassphrase',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description:
        'Default passphrase for transaction signing (optional). Can be overridden per operation.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.environment === "production" ? "https://app.bitgo.com/api/v2" : "https://app.bitgo-test.com/api/v2"}}',
      url: '/user/me',
      method: 'GET',
    },
  };
}
