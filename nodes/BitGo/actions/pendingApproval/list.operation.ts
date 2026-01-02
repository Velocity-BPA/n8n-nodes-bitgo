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
import { bitgoCoinApiRequest, bitgoCoinApiRequestAllItems } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Scope',
    name: 'scope',
    type: 'options',
    options: [
      { name: 'Wallet', value: 'wallet' },
      { name: 'Enterprise', value: 'enterprise' },
    ],
    required: true,
    default: 'wallet',
    description: 'Scope of pending approvals to list',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Wallet ID',
    name: 'walletId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the wallet',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
        scope: ['wallet'],
      },
    },
  },
  {
    displayName: 'Enterprise ID',
    name: 'enterpriseId',
    type: 'string',
    required: true,
    default: '',
    description: 'The ID of the enterprise',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
        scope: ['enterprise'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Max number of results to return',
    typeOptions: {
      minValue: 1,
      maxValue: 500,
    },
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['pendingApproval'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'State',
        name: 'state',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Rejected', value: 'rejected' },
          { name: 'Canceled', value: 'canceled' },
        ],
        default: 'pending',
        description: 'Filter by approval state',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
  coin: string,
): Promise<INodeExecutionData[]> {
  const scope = this.getNodeParameter('scope', index) as string;
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const filters = this.getNodeParameter('filters', index, {}) as {
    state?: string;
  };

  const qs: Record<string, string | number> = {};

  if (filters.state) {
    qs.state = filters.state;
  }

  let endpoint: string;

  if (scope === 'wallet') {
    const walletId = this.getNodeParameter('walletId', index) as string;
    endpoint = `/wallet/${walletId}/pendingapprovals`;
  } else {
    const enterpriseId = this.getNodeParameter('enterpriseId', index) as string;
    endpoint = `/enterprise/${enterpriseId}/pendingapprovals`;
  }

  let pendingApprovals;

  if (returnAll) {
    pendingApprovals = await bitgoCoinApiRequestAllItems.call(
      this,
      'GET',
      coin,
      endpoint,
      {},
      qs,
      undefined,
      'pendingApprovals',
    );
  } else {
    const limit = this.getNodeParameter('limit', index) as number;
    qs.limit = limit;
    const response = await bitgoCoinApiRequest.call(this, 'GET', coin, endpoint, {}, qs);
    pendingApprovals = (response as { pendingApprovals?: IDataObject[] }).pendingApprovals || [];
  }

  return this.helpers.returnJsonArray(pendingApprovals as IDataObject[]);
}
