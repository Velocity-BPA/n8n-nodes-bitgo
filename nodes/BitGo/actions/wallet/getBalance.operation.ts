/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { bitgoCoinApiRequest } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet to get balances for',
    displayOptions: {
      show: {
        resource: ['wallet'],
        operation: ['getBalance'],
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
        operation: ['getBalance'],
      },
    },
    options: [
      {
        displayName: 'All Tokens',
        name: 'allTokens',
        type: 'boolean',
        default: false,
        description: 'Whether to include all token balances',
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

  const walletData = wallet as {
    balance?: number;
    balanceString?: string;
    confirmedBalance?: number;
    confirmedBalanceString?: string;
    spendableBalance?: number;
    spendableBalanceString?: string;
  };

  const balanceInfo = {
    balance: walletData.balance,
    balanceString: walletData.balanceString,
    confirmedBalance: walletData.confirmedBalance,
    confirmedBalanceString: walletData.confirmedBalanceString,
    spendableBalance: walletData.spendableBalance,
    spendableBalanceString: walletData.spendableBalanceString,
  };

  return this.helpers.returnJsonArray(balanceInfo);
}
