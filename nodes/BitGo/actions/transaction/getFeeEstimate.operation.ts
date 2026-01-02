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
        resource: ['transaction'],
        operation: ['getFeeEstimate'],
      },
    },
    options: [
      {
        displayName: 'Number of Blocks',
        name: 'numBlocks',
        type: 'number',
        default: 2,
        description: 'Target number of blocks for confirmation',
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
    numBlocks?: number;
  };

  const qs: Record<string, number> = {};

  if (options.numBlocks) {
    qs.numBlocks = options.numBlocks;
  }

  const feeEstimate = await bitgoCoinApiRequest.call(this, 'GET', coin, '/tx/fee', {}, qs);

  return this.helpers.returnJsonArray(feeEstimate as IDataObject);
}
