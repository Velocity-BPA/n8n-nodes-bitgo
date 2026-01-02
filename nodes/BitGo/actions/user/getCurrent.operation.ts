/**
 * n8n-nodes-bitgo
 * Copyright (c) 2025 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  IDataObject,
} from 'n8n-workflow';
import { bitgoApiRequest } from '../../transport/requestWithAuth';

export const description: INodeProperties[] = [];

export async function execute(
  this: IExecuteFunctions,
  _index: number,
): Promise<INodeExecutionData[]> {
  const response = await bitgoApiRequest.call(this, 'GET', '/user/me');

  return this.helpers.returnJsonArray(response as IDataObject);
}
