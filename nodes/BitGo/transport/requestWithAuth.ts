/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  IHookFunctions,
  ILoadOptionsFunctions,
  IWebhookFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { BITGO_ENVIRONMENTS } from '../constants';

/**
 * Logging flag for licensing notice
 */
let licensingNoticeLogged = false;

/**
 * Log the Velocity BPA licensing notice (once per node load)
 */
export function logLicensingNotice(): void {
  if (!licensingNoticeLogged) {
    console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
    licensingNoticeLogged = true;
  }
}

/**
 * Get the base URL for the BitGo API based on environment
 */
export function getBaseUrl(environment: 'production' | 'test'): string {
  return BITGO_ENVIRONMENTS[environment];
}

/**
 * Make an authenticated request to the BitGo API
 *
 * @param context - The execution context
 * @param method - HTTP method
 * @param endpoint - API endpoint (without base URL)
 * @param body - Request body (optional)
 * @param qs - Query string parameters (optional)
 * @returns API response data
 */
export async function bitgoApiRequest(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  // Log licensing notice once
  logLicensingNotice();

  const credentials = await this.getCredentials('bitGoApi');

  if (!credentials) {
    throw new NodeOperationError(this.getNode(), 'No credentials provided for BitGo API');
  }

  const environment = credentials.environment as 'production' | 'test';
  const baseUrl = getBaseUrl(environment);

  const options: IHttpRequestOptions = {
    method,
    url: `${baseUrl}${endpoint}`,
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    json: true,
  };

  if (Object.keys(body).length > 0) {
    options.body = body;
  }

  if (Object.keys(qs).length > 0) {
    options.qs = qs;
  }

  try {
    const response = await this.helpers.httpRequest(options);
    return response as IDataObject | IDataObject[];
  } catch (error) {
    const errorData = error as JsonObject;
    throw new NodeApiError(this.getNode(), errorData, {
      message: `BitGo API request failed: ${(error as Error).message || 'Unknown error'}`,
    });
  }
}

/**
 * Make an authenticated request to a coin-specific endpoint
 *
 * @param context - The execution context
 * @param method - HTTP method
 * @param coin - Coin type (e.g., 'btc', 'eth')
 * @param endpoint - API endpoint (without coin prefix)
 * @param body - Request body (optional)
 * @param qs - Query string parameters (optional)
 * @returns API response data
 */
export async function bitgoCoinApiRequest(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions,
  method: IHttpRequestMethods,
  coin: string,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
  const fullEndpoint = `/${coin}${endpoint}`;
  return bitgoApiRequest.call(this, method, fullEndpoint, body, qs);
}

/**
 * Make a paginated request to the BitGo API
 *
 * @param context - The execution context
 * @param method - HTTP method
 * @param endpoint - API endpoint
 * @param body - Request body (optional)
 * @param qs - Query string parameters (optional)
 * @param limit - Maximum number of results to return
 * @param propertyName - Property name containing the results array
 * @returns All paginated results
 */
export async function bitgoApiRequestAllItems(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  limit?: number,
  propertyName?: string,
): Promise<IDataObject[]> {
  const returnData: IDataObject[] = [];
  let responseData: IDataObject;
  let prevId: string | undefined;

  qs.limit = qs.limit || 100;

  do {
    if (prevId) {
      qs.prevId = prevId;
    }

    responseData = (await bitgoApiRequest.call(this, method, endpoint, body, qs)) as IDataObject;

    // Find the results array in the response
    let results: IDataObject[] = [];

    if (propertyName && responseData[propertyName]) {
      results = responseData[propertyName] as IDataObject[];
    } else {
      // Try common property names
      const possibleNames = [
        'wallets',
        'addresses',
        'transactions',
        'transfers',
        'keys',
        'pendingApprovals',
        'policies',
        'webhooks',
        'users',
        'notifications',
        'coins',
        'stakes',
        'rewards',
        'unspents',
      ];

      for (const name of possibleNames) {
        if (Array.isArray(responseData[name])) {
          results = responseData[name] as IDataObject[];
          break;
        }
      }

      // If still no results found and response is an array
      if (results.length === 0 && Array.isArray(responseData)) {
        results = responseData;
      }
    }

    returnData.push(...results);

    // Check for pagination
    prevId = responseData.nextBatchPrevId as string | undefined;

    // Check limit
    if (limit && returnData.length >= limit) {
      return returnData.slice(0, limit);
    }
  } while (prevId);

  return returnData;
}

/**
 * Make a paginated request to a coin-specific endpoint
 */
export async function bitgoCoinApiRequestAllItems(
  this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  coin: string,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  limit?: number,
  propertyName?: string,
): Promise<IDataObject[]> {
  const fullEndpoint = `/${coin}${endpoint}`;
  return bitgoApiRequestAllItems.call(this, method, fullEndpoint, body, qs, limit, propertyName);
}

/**
 * Validate and get wallet passphrase from parameters or credentials
 */
export async function validateWalletPassphrase(
  this: IExecuteFunctions,
  index: number,
): Promise<string> {
  // Try to get from operation parameter first
  let passphrase: string | undefined;

  try {
    passphrase = this.getNodeParameter('walletPassphrase', index, '') as string;
  } catch {
    // Parameter doesn't exist for this operation
  }

  // If not provided, try credentials
  if (!passphrase) {
    const credentials = await this.getCredentials('bitGoApi');
    passphrase = credentials?.walletPassphrase as string | undefined;
  }

  if (!passphrase) {
    throw new NodeOperationError(
      this.getNode(),
      'Wallet passphrase is required for this operation. Provide it in the operation parameters or in the credentials.',
    );
  }

  return passphrase;
}

/**
 * Format amount for BitGo API (handles string/number conversion)
 */
export function formatAmount(amount: string | number): string {
  if (typeof amount === 'string') {
    return amount;
  }
  return amount.toString();
}

/**
 * Parse BitGo amount string to number
 */
export function parseAmount(amountString: string): number {
  return parseInt(amountString, 10);
}

/**
 * Build recipients array for transaction
 */
export function buildRecipients(
  recipients: Array<{ address: string; amount: string | number }>,
): Array<{ address: string; amount: string }> {
  return recipients.map((r) => ({
    address: r.address,
    amount: formatAmount(r.amount),
  }));
}
