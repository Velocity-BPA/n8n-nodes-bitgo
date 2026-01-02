/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { logLicensingNotice } from './transport';
import { SUPPORTED_COINS, TESTNET_COINS } from './constants';
import * as wallet from './actions/wallet';
import * as address from './actions/address';
import * as transaction from './actions/transaction';
import * as transfer from './actions/transfer';
import * as key from './actions/key';
import * as pendingApproval from './actions/pendingApproval';
import * as policy from './actions/policy';
import * as webhook from './actions/webhook';
import * as user from './actions/user';
import * as enterprise from './actions/enterprise';
import * as coin from './actions/coin';
import * as staking from './actions/staking';

/**
 * BitGo institutional digital asset custody n8n node
 * Provides access to BitGo's enterprise wallet infrastructure
 */
export class BitGo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BitGo',
    name: 'bitGo',
    icon: 'file:bitgo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with BitGo institutional digital asset custody platform',
    defaults: {
      name: 'BitGo',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'bitGoApi',
        required: true,
      },
    ],
    properties: [
      // Coin selection - used by most operations
      {
        displayName: 'Coin',
        name: 'coin',
        type: 'options',
        noDataExpression: true,
        options: [
          ...SUPPORTED_COINS.map((c) => ({ name: c.toUpperCase(), value: c })),
          ...TESTNET_COINS.map((c) => ({ name: `${c.toUpperCase()} (Testnet)`, value: c })),
        ],
        default: 'btc',
        description: 'The cryptocurrency to operate on',
        displayOptions: {
          hide: {
            resource: ['user', 'enterprise', 'coin'],
          },
        },
      },
      // Resource selection
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Address',
            value: 'address',
            description: 'Manage wallet addresses',
          },
          {
            name: 'Coin',
            value: 'coin',
            description: 'Get coin and market information',
          },
          {
            name: 'Enterprise',
            value: 'enterprise',
            description: 'Manage enterprise settings',
          },
          {
            name: 'Key',
            value: 'key',
            description: 'Manage keychains',
          },
          {
            name: 'Pending Approval',
            value: 'pendingApproval',
            description: 'Manage pending approvals',
          },
          {
            name: 'Policy',
            value: 'policy',
            description: 'Manage wallet policies',
          },
          {
            name: 'Staking',
            value: 'staking',
            description: 'Manage staking operations',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'View transaction details',
          },
          {
            name: 'Transfer',
            value: 'transfer',
            description: 'View transfer history',
          },
          {
            name: 'User',
            value: 'user',
            description: 'Manage users',
          },
          {
            name: 'Wallet',
            value: 'wallet',
            description: 'Manage wallets',
          },
          {
            name: 'Webhook',
            value: 'webhook',
            description: 'Manage webhooks',
          },
        ],
        default: 'wallet',
      },
      // === WALLET Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['wallet'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new wallet',
            action: 'Create a wallet',
          },
          {
            name: 'Freeze',
            value: 'freeze',
            description: 'Freeze or unfreeze a wallet',
            action: 'Freeze a wallet',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a wallet by ID',
            action: 'Get a wallet',
          },
          {
            name: 'Get Balance',
            value: 'getBalance',
            description: 'Get wallet balance',
            action: 'Get wallet balance',
          },
          {
            name: 'Get Max Spendable',
            value: 'getMaxSpendable',
            description: 'Get maximum spendable amount',
            action: 'Get max spendable',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all wallets',
            action: 'List wallets',
          },
          {
            name: 'Send',
            value: 'send',
            description: 'Send cryptocurrency',
            action: 'Send cryptocurrency',
          },
          {
            name: 'Send Many',
            value: 'sendMany',
            description: 'Send to multiple recipients',
            action: 'Send to many',
          },
          {
            name: 'Sweep',
            value: 'sweep',
            description: 'Sweep entire wallet balance',
            action: 'Sweep wallet',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update wallet settings',
            action: 'Update a wallet',
          },
        ],
        default: 'list',
      },
      // === ADDRESS Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['address'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new address',
            action: 'Create an address',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get address details',
            action: 'Get an address',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List wallet addresses',
            action: 'List addresses',
          },
          {
            name: 'Verify',
            value: 'verify',
            description: 'Verify an address',
            action: 'Verify an address',
          },
        ],
        default: 'list',
      },
      // === TRANSACTION Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transaction'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get transaction details',
            action: 'Get a transaction',
          },
          {
            name: 'Get Fee Estimate',
            value: 'getFeeEstimate',
            description: 'Get fee estimate',
            action: 'Get fee estimate',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List transactions',
            action: 'List transactions',
          },
        ],
        default: 'list',
      },
      // === TRANSFER Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['transfer'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get transfer details',
            action: 'Get a transfer',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List transfers',
            action: 'List transfers',
          },
        ],
        default: 'list',
      },
      // === KEY Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['key'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new keychain',
            action: 'Create a key',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get key details',
            action: 'Get a key',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List keys',
            action: 'List keys',
          },
        ],
        default: 'list',
      },
      // === PENDING APPROVAL Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['pendingApproval'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get pending approval details',
            action: 'Get a pending approval',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List pending approvals',
            action: 'List pending approvals',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Approve or reject',
            action: 'Update a pending approval',
          },
        ],
        default: 'list',
      },
      // === POLICY Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['policy'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a policy rule',
            action: 'Create a policy',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a policy rule',
            action: 'Delete a policy',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get policy details',
            action: 'Get a policy',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List policies',
            action: 'List policies',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a policy rule',
            action: 'Update a policy',
          },
        ],
        default: 'list',
      },
      // === WEBHOOK Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['webhook'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a webhook',
            action: 'Create a webhook',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a webhook',
            action: 'Delete a webhook',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get webhook details',
            action: 'Get a webhook',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List webhooks',
            action: 'List webhooks',
          },
          {
            name: 'Simulate',
            value: 'simulate',
            description: 'Simulate a webhook',
            action: 'Simulate a webhook',
          },
        ],
        default: 'list',
      },
      // === USER Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['user'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get user details',
            action: 'Get a user',
          },
          {
            name: 'Get Current',
            value: 'getCurrent',
            description: 'Get current authenticated user',
            action: 'Get current user',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List enterprise users',
            action: 'List users',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update user settings',
            action: 'Update a user',
          },
        ],
        default: 'getCurrent',
      },
      // === ENTERPRISE Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['enterprise'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get enterprise details',
            action: 'Get enterprise',
          },
          {
            name: 'Get Wallets',
            value: 'getWallets',
            description: 'Get enterprise wallets',
            action: 'Get enterprise wallets',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update enterprise settings',
            action: 'Update enterprise',
          },
        ],
        default: 'get',
      },
      // === COIN Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['coin'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get coin details',
            action: 'Get coin',
          },
          {
            name: 'Get Market Data',
            value: 'getMarketData',
            description: 'Get coin market data',
            action: 'Get market data',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List supported coins',
            action: 'List coins',
          },
        ],
        default: 'list',
      },
      // === STAKING Operations ===
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['staking'],
          },
        },
        options: [
          {
            name: 'Create Staking',
            value: 'createStaking',
            description: 'Create a staking request',
            action: 'Create staking',
          },
          {
            name: 'Create Unstaking',
            value: 'createUnstaking',
            description: 'Create an unstaking request',
            action: 'Create unstaking',
          },
          {
            name: 'Get Details',
            value: 'getDetails',
            description: 'Get staking details',
            action: 'Get staking details',
          },
          {
            name: 'Get Rewards',
            value: 'getRewards',
            description: 'Get staking rewards',
            action: 'Get staking rewards',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List staking wallets',
            action: 'List staking wallets',
          },
        ],
        default: 'list',
      },
      // Operation-specific fields from action modules
      ...wallet.list.description,
      ...wallet.get.description,
      ...wallet.create.description,
      ...wallet.update.description,
      ...wallet.send.description,
      ...wallet.sendMany.description,
      ...wallet.getBalance.description,
      ...wallet.freeze.description,
      ...wallet.getMaxSpendable.description,
      ...wallet.sweep.description,
      ...address.list.description,
      ...address.get.description,
      ...address.create.description,
      ...address.verify.description,
      ...transaction.list.description,
      ...transaction.get.description,
      ...transaction.getFeeEstimate.description,
      ...transfer.list.description,
      ...transfer.get.description,
      ...key.list.description,
      ...key.get.description,
      ...key.create.description,
      ...pendingApproval.list.description,
      ...pendingApproval.get.description,
      ...pendingApproval.update.description,
      ...policy.list.description,
      ...policy.get.description,
      ...policy.create.description,
      ...policy.update.description,
      ...policy.delete.description,
      ...webhook.list.description,
      ...webhook.get.description,
      ...webhook.create.description,
      ...webhook.delete.description,
      ...webhook.simulate.description,
      ...user.getCurrent.description,
      ...user.get.description,
      ...user.list.description,
      ...user.update.description,
      ...enterprise.get.description,
      ...enterprise.update.description,
      ...enterprise.getWallets.description,
      ...coin.list.description,
      ...coin.get.description,
      ...coin.getMarketData.description,
      ...staking.list.description,
      ...staking.getDetails.description,
      ...staking.createStaking.description,
      ...staking.createUnstaking.description,
      ...staking.getRewards.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once
    logLicensingNotice();

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    // Get coin for coin-specific operations
    let coinParam = 'btc';
    if (!['user', 'enterprise', 'coin'].includes(resource)) {
      coinParam = this.getNodeParameter('coin', 0) as string;
    }

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'wallet':
            switch (operation) {
              case 'list':
                result = await wallet.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await wallet.get.execute.call(this, i, coinParam);
                break;
              case 'create':
                result = await wallet.create.execute.call(this, i, coinParam);
                break;
              case 'update':
                result = await wallet.update.execute.call(this, i, coinParam);
                break;
              case 'send':
                result = await wallet.send.execute.call(this, i, coinParam);
                break;
              case 'sendMany':
                result = await wallet.sendMany.execute.call(this, i, coinParam);
                break;
              case 'getBalance':
                result = await wallet.getBalance.execute.call(this, i, coinParam);
                break;
              case 'freeze':
                result = await wallet.freeze.execute.call(this, i, coinParam);
                break;
              case 'getMaxSpendable':
                result = await wallet.getMaxSpendable.execute.call(this, i, coinParam);
                break;
              case 'sweep':
                result = await wallet.sweep.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown wallet operation: ${operation}`,
                );
            }
            break;

          case 'address':
            switch (operation) {
              case 'list':
                result = await address.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await address.get.execute.call(this, i, coinParam);
                break;
              case 'create':
                result = await address.create.execute.call(this, i, coinParam);
                break;
              case 'verify':
                result = await address.verify.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown address operation: ${operation}`,
                );
            }
            break;

          case 'transaction':
            switch (operation) {
              case 'list':
                result = await transaction.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await transaction.get.execute.call(this, i, coinParam);
                break;
              case 'getFeeEstimate':
                result = await transaction.getFeeEstimate.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown transaction operation: ${operation}`,
                );
            }
            break;

          case 'transfer':
            switch (operation) {
              case 'list':
                result = await transfer.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await transfer.get.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown transfer operation: ${operation}`,
                );
            }
            break;

          case 'key':
            switch (operation) {
              case 'list':
                result = await key.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await key.get.execute.call(this, i, coinParam);
                break;
              case 'create':
                result = await key.create.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(this.getNode(), `Unknown key operation: ${operation}`);
            }
            break;

          case 'pendingApproval':
            switch (operation) {
              case 'list':
                result = await pendingApproval.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await pendingApproval.get.execute.call(this, i, coinParam);
                break;
              case 'update':
                result = await pendingApproval.update.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown pendingApproval operation: ${operation}`,
                );
            }
            break;

          case 'policy':
            switch (operation) {
              case 'list':
                result = await policy.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await policy.get.execute.call(this, i, coinParam);
                break;
              case 'create':
                result = await policy.create.execute.call(this, i, coinParam);
                break;
              case 'update':
                result = await policy.update.execute.call(this, i, coinParam);
                break;
              case 'delete':
                result = await policy.delete.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown policy operation: ${operation}`,
                );
            }
            break;

          case 'webhook':
            switch (operation) {
              case 'list':
                result = await webhook.list.execute.call(this, i, coinParam);
                break;
              case 'get':
                result = await webhook.get.execute.call(this, i, coinParam);
                break;
              case 'create':
                result = await webhook.create.execute.call(this, i, coinParam);
                break;
              case 'delete':
                result = await webhook.delete.execute.call(this, i, coinParam);
                break;
              case 'simulate':
                result = await webhook.simulate.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown webhook operation: ${operation}`,
                );
            }
            break;

          case 'user':
            switch (operation) {
              case 'getCurrent':
                result = await user.getCurrent.execute.call(this, i);
                break;
              case 'get':
                result = await user.get.execute.call(this, i);
                break;
              case 'list':
                result = await user.list.execute.call(this, i);
                break;
              case 'update':
                result = await user.update.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown user operation: ${operation}`,
                );
            }
            break;

          case 'enterprise':
            switch (operation) {
              case 'get':
                result = await enterprise.get.execute.call(this, i);
                break;
              case 'update':
                result = await enterprise.update.execute.call(this, i);
                break;
              case 'getWallets':
                result = await enterprise.getWallets.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown enterprise operation: ${operation}`,
                );
            }
            break;

          case 'coin':
            switch (operation) {
              case 'list':
                result = await coin.list.execute.call(this, i);
                break;
              case 'get':
                result = await coin.get.execute.call(this, i);
                break;
              case 'getMarketData':
                result = await coin.getMarketData.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown coin operation: ${operation}`,
                );
            }
            break;

          case 'staking':
            switch (operation) {
              case 'list':
                result = await staking.list.execute.call(this, i, coinParam);
                break;
              case 'getDetails':
                result = await staking.getDetails.execute.call(this, i, coinParam);
                break;
              case 'createStaking':
                result = await staking.createStaking.execute.call(this, i, coinParam);
                break;
              case 'createUnstaking':
                result = await staking.createUnstaking.execute.call(this, i, coinParam);
                break;
              case 'getRewards':
                result = await staking.getRewards.execute.call(this, i, coinParam);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown staking operation: ${operation}`,
                );
            }
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
