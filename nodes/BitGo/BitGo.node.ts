/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-bitgo/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class BitGo implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BitGo',
    name: 'bitgo',
    icon: 'file:bitgo.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the BitGo API',
    defaults: {
      name: 'BitGo',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'bitgoApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Wallet',
            value: 'wallet',
          },
          {
            name: 'Address',
            value: 'address',
          },
          {
            name: 'Transaction',
            value: 'transaction',
          },
          {
            name: 'Transfer',
            value: 'transfer',
          },
          {
            name: 'Key',
            value: 'key',
          },
          {
            name: 'PendingApproval',
            value: 'pendingApproval',
          },
          {
            name: 'Webhook',
            value: 'webhook',
          },
          {
            name: 'Enterprise',
            value: 'enterprise',
          },
          {
            name: 'Policy',
            value: 'policy',
          }
        ],
        default: 'wallet',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['wallet'] } },
  options: [
    { name: 'Create Wallet', value: 'createWallet', description: 'Create a new multi-signature wallet', action: 'Create wallet' },
    { name: 'Get Wallet', value: 'getWallet', description: 'Get wallet details by ID', action: 'Get wallet' },
    { name: 'List Wallets', value: 'listWallets', description: 'List all wallets for a coin', action: 'List wallets' },
    { name: 'Update Wallet', value: 'updateWallet', description: 'Update wallet settings', action: 'Update wallet' },
    { name: 'Delete Wallet', value: 'deleteWallet', description: 'Delete a wallet', action: 'Delete wallet' },
    { name: 'Get Wallet Addresses', value: 'getWalletAddresses', description: 'Get wallet addresses', action: 'Get wallet addresses' },
    { name: 'Create Address', value: 'createAddress', description: 'Generate new address', action: 'Create address' },
    { name: 'Freeze Wallet', value: 'freezeWallet', description: 'Freeze wallet operations', action: 'Freeze wallet' }
  ],
  default: 'listWallets',
},
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
			name: 'Create Address',
			value: 'createAddress',
			description: 'Generate new receive address for wallet',
			action: 'Create address',
		},
		{
			name: 'Get Address',
			value: 'getAddress',
			description: 'Get details of a specific address',
			action: 'Get address',
		},
		{
			name: 'List Addresses',
			value: 'listAddresses',
			description: 'List all addresses for a wallet',
			action: 'List addresses',
		},
		{
			name: 'Update Address',
			value: 'updateAddress',
			description: 'Update address label',
			action: 'Update address',
		},
	],
	default: 'createAddress',
},
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
      name: 'List Transactions',
      value: 'listTransactions',
      description: 'Get wallet transactions',
      action: 'List wallet transactions',
    },
    {
      name: 'Get Transaction',
      value: 'getTransaction',
      description: 'Get transaction details',
      action: 'Get transaction details',
    },
    {
      name: 'Build Transaction',
      value: 'buildTransaction',
      description: 'Build unsigned transaction',
      action: 'Build unsigned transaction',
    },
    {
      name: 'Send Transaction',
      value: 'sendTransaction',
      description: 'Send signed transaction',
      action: 'Send signed transaction',
    },
    {
      name: 'Sign Transaction',
      value: 'signTransaction',
      description: 'Sign transaction',
      action: 'Sign transaction',
    },
    {
      name: 'Create Transaction',
      value: 'createTransaction',
      description: 'Send cryptocurrency to address',
      action: 'Create a transaction',
    },
    {
      name: 'List Transfers',
      value: 'listTransfers',
      description: 'Get transfers',
      action: 'List wallet transfers',
    },
    {
      name: 'Get Transfer',
      value: 'getTransfer',
      description: 'Get transfer details',
      action: 'Get transfer details',
    },
  ],
  default: 'listTransactions',
},
{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['transfer'] } },
	options: [
		{
			name: 'Create Transfer',
			value: 'createTransfer',
			description: 'Initiate transfer with policies',
			action: 'Create transfer',
		},
		{
			name: 'Get Transfer',
			value: 'getTransfer',
			description: 'Get transfer status',
			action: 'Get transfer',
		},
		{
			name: 'List Transfers',
			value: 'listTransfers',
			description: 'List wallet transfers',
			action: 'List transfers',
		},
		{
			name: 'Update Transfer',
			value: 'updateTransfer',
			description: 'Accept or reject pending transfer',
			action: 'Update transfer',
		},
		{
			name: 'Cancel Transfer',
			value: 'cancelTransfer',
			description: 'Cancel pending transfer',
			action: 'Cancel transfer',
		},
	],
	default: 'createTransfer',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['key'] } },
  options: [
    { name: 'Create Keychain', value: 'createKeychain', description: 'Generate a new keychain for wallet operations', action: 'Create a new keychain' },
    { name: 'Get Keychain', value: 'getKeychain', description: 'Get details of a specific keychain', action: 'Get keychain details' },
    { name: 'Update Keychain', value: 'updateKeychain', description: 'Update keychain properties', action: 'Update keychain properties' },
    { name: 'Consolidate Unspents', value: 'consolidateUnspents', description: 'Consolidate wallet UTXOs (Unspent Transaction Outputs)', action: 'Consolidate wallet UTXOs' },
    { name: 'List Unspents', value: 'listUnspents', description: 'List unspent transaction outputs for a wallet', action: 'List unspent transaction outputs' }
  ],
  default: 'createKeychain',
},
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
      name: 'List Pending Approvals',
      value: 'listPendingApprovals',
      description: 'Get pending approvals for wallet or enterprise',
      action: 'List pending approvals',
    },
    {
      name: 'Get Pending Approval',
      value: 'getPendingApproval',
      description: 'Get details of a specific pending approval',
      action: 'Get pending approval',
    },
    {
      name: 'Update Approval State',
      value: 'updateApprovalState',
      description: 'Approve or reject a pending approval',
      action: 'Update approval state',
    },
    {
      name: 'Construct Approval Transaction',
      value: 'constructApprovalTransaction',
      description: 'Construct approval transaction with recipients and fee rate',
      action: 'Construct approval transaction',
    },
    {
      name: 'Cancel Pending Approval',
      value: 'cancelPendingApproval',
      description: 'Cancel a pending approval',
      action: 'Cancel pending approval',
    },
  ],
  default: 'listPendingApprovals',
},
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
      name: 'List Webhooks',
      value: 'listWebhooks',
      description: 'Get wallet webhooks',
      action: 'List webhooks',
    },
    {
      name: 'Create Webhook',
      value: 'createWebhook',
      description: 'Add webhook subscription',
      action: 'Create webhook',
    },
    {
      name: 'Get Webhook',
      value: 'getWebhook',
      description: 'Get webhook details',
      action: 'Get webhook',
    },
    {
      name: 'Update Webhook',
      value: 'updateWebhook',
      description: 'Update webhook',
      action: 'Update webhook',
    },
    {
      name: 'Remove Webhook',
      value: 'removeWebhook',
      description: 'Remove webhook',
      action: 'Remove webhook',
    },
    {
      name: 'Simulate Webhook',
      value: 'simulateWebhook',
      description: 'Test webhook delivery',
      action: 'Simulate webhook',
    },
    {
      name: 'Delete Webhook',
      value: 'deleteWebhook',
      description: 'Remove webhook',
      action: 'Delete a webhook',
    },
  ],
  default: 'listWebhooks',
},
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
      name: 'List Enterprises',
      value: 'listEnterprises',
      description: 'Get user enterprises',
      action: 'List enterprises',
    },
    {
      name: 'Get Enterprise',
      value: 'getEnterprise',
      description: 'Get enterprise details',
      action: 'Get enterprise',
    },
    {
      name: 'Update Enterprise',
      value: 'updateEnterprise',
      description: 'Update enterprise settings',
      action: 'Update enterprise',
    },
    {
      name: 'Get Enterprise Users',
      value: 'getEnterpriseUsers',
      description: 'Get enterprise users',
      action: 'Get enterprise users',
    },
    {
      name: 'Add Enterprise User',
      value: 'addEnterpriseUser',
      description: 'Add user to enterprise',
      action: 'Add enterprise user',
    },
    {
      name: 'Remove Enterprise User',
      value: 'removeEnterpriseUser',
      description: 'Remove user from enterprise',
      action: 'Remove enterprise user',
    },
    {
      name: 'Get Enterprise Wallets',
      value: 'getEnterpriseWallets',
      description: 'Get enterprise wallets',
      action: 'Get enterprise wallets',
    },
  ],
  default: 'listEnterprises',
},
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
      name: 'Get Wallet Policy',
      value: 'getWalletPolicy',
      description: 'Get wallet policy',
      action: 'Get wallet policy',
    },
    {
      name: 'Update Wallet Policy',
      value: 'updateWalletPolicy',
      description: 'Update policy rules',
      action: 'Update wallet policy',
    },
    {
      name: 'Add Policy Rule',
      value: 'addPolicyRule',
      description: 'Add new policy rule',
      action: 'Add policy rule',
    },
    {
      name: 'Remove Policy Rule',
      value: 'removePolicyRule',
      description: 'Remove policy rule',
      action: 'Remove policy rule',
    },
    {
      name: 'Get Enterprise Policy',
      value: 'getEnterprisePolicy',
      description: 'Get enterprise policy',
      action: 'Get enterprise policy',
    },
    {
      name: 'Update Enterprise Policy',
      value: 'updateEnterprisePolicy',
      description: 'Update enterprise policy',
      action: 'Update enterprise policy',
    },
  ],
  default: 'getWalletPolicy',
},
      // Parameter definitions
{
  displayName: 'Coin',
  name: 'coin',
  type: 'string',
  required: true,
  default: 'btc',
  description: 'Cryptocurrency identifier (btc, eth, ltc, etc.)',
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet', 'getWallet', 'listWallets', 'updateWallet', 'freezeWallet', 'deleteWallet', 'getWalletAddresses', 'createAddress'] } },
},
{
  displayName: 'Label',
  name: 'label',
  type: 'string',
  required: true,
  default: '',
  description: 'A human-readable name for the wallet',
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet'] } },
},
{
  displayName: 'Passphrase',
  name: 'passphrase',
  type: 'string',
  typeOptions: { password: true },
  required: true,
  default: '',
  description: 'Passphrase to encrypt the wallet',
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet'] } },
},
{
  displayName: 'User Key',
  name: 'userKey',
  type: 'string',
  required: false,
  default: '',
  description: 'User public key for multi-signature setup',
  displayOptions: { show: { resource: ['wallet'], operation: ['createWallet'] } },
},
{
  displayName: 'Backup XPub',
  name: 'backupXpub',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createWallet'],
    },
  },
  default: '',
  description: 'Backup extended public key',
},
{
  displayName: 'Enterprise',
  name: 'enterprise',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createWallet'],
    },
  },
  default: '',
  description: 'Enterprise ID for enterprise wallets',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  default: '',
  description: 'The unique identifier of the wallet',
  displayOptions: { show: { resource: ['wallet'], operation: ['getWallet', 'updateWallet', 'deleteWallet', 'getWalletAddresses', 'createAddress', 'freezeWallet'] } },
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  default: 25,
  description: 'Maximum number of wallets to return',
  displayOptions: { show: { resource: ['wallet'], operation: ['listWallets'] } },
},
{
  displayName: 'Previous ID',
  name: 'prevId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['listWallets'],
    },
  },
  default: '',
  description: 'Return the next batch of results after this wallet ID',
},
{
  displayName: 'Label',
  name: 'updateLabel',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['updateWallet'],
    },
  },
  default: '',
  description: 'New label for the wallet',
},
{
  displayName: 'Approvals Required',
  name: 'approvalsRequired',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['updateWallet'],
    },
  },
  default: 1,
  description: 'Number of approvals required for transactions',
},
{
  displayName: 'Mine',
  name: 'mine',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['getWalletAddresses'],
    },
  },
  default: false,
  description: 'Only return addresses that belong to the current user',
},
{
  displayName: 'Chain',
  name: 'chain',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createAddress'],
    },
  },
  default: 0,
  description: 'Chain index for the new address (0 for receive, 1 for change)',
},
{
  displayName: 'Address Label',
  name: 'addressLabel',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['wallet'],
      operation: ['createAddress'],
    },
  },
  default: '',
  description: 'Label for the new address',
},
{
  displayName: 'Duration',
  name: 'duration',
  type: 'number',
  required: false,
  default: 3600,
  description: 'Duration to freeze the wallet in seconds',
  displayOptions: { show: { resource: ['wallet'], operation: ['freezeWallet'] } },
},
{
	displayName: 'Coin',
	name: 'coin',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['createAddress', 'getAddress', 'listAddresses', 'updateAddress'],
		},
	},
	default: 'btc',
	placeholder: 'btc',
	description: 'Cryptocurrency identifier (btc, eth, ltc, etc.)',
},
{
	displayName: 'Wallet ID',
	name: 'walletId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['createAddress', 'getAddress', 'listAddresses', 'updateAddress'],
		},
	},
	default: '',
	description: 'The wallet ID to perform address operations on',
},
{
	displayName: 'Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['getAddress', 'updateAddress'],
		},
	},
	default: '',
	description: 'The address to get or update',
},
{
	displayName: 'Chain',
	name: 'chain',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['createAddress'],
		},
	},
	default: 0,
	description: 'Address chain (0 for receive addresses, 1 for change addresses)',
},
{
	displayName: 'Label',
	name: 'label',
	type: 'string',
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['createAddress', 'updateAddress'],
		},
	},
	default: '',
	description: 'Label for the address',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['listAddresses'],
		},
	},
	default: 25,
	description: 'Maximum number of addresses to return',
},
{
	displayName: 'Skip',
	name: 'skip',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['address'],
			operation: ['listAddresses'],
		},
	},
	default: 0,
	description: 'Number of addresses to skip',
},
{
  displayName: 'Coin Type',
  name: 'coinType',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  default: 'btc',
  description: 'The coin type (e.g., btc, eth, ltc)',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
    },
  },
  default: '',
  description: 'The wallet ID',
},
{
  displayName: 'Transaction ID',
  name: 'txId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransaction'],
    },
  },
  default: '',
  description: 'The transaction ID',
},
{
  displayName: 'Transfer ID',
  name: 'transferId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['getTransfer'],
    },
  },
  default: '',
  description: 'The transfer ID',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['listTransactions', 'listTransfers'],
    },
  },
  default: 50,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Previous ID',
  name: 'prevId',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['listTransactions'],
    },
  },
  default: '',
  description: 'Previous ID for pagination',
},
{
  displayName: 'State',
  name: 'state',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['listTransactions', 'listTransfers'],
    },
  },
  options: [
    {
      name: 'Confirmed',
      value: 'confirmed',
    },
    {
      name: 'Unconfirmed',
      value: 'unconfirmed',
    },
    {
      name: 'Pending',
      value: 'pending',
    },
  ],
  default: 'confirmed',
  description: 'Filter by transaction state',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['listTransfers'],
    },
  },
  options: [
    {
      name: 'Send',
      value: 'send',
    },
    {
      name: 'Receive',
      value: 'receive',
    },
  ],
  default: 'send',
  description: 'Filter by transfer type',
},
{
  displayName: 'Recipients',
  name: 'recipients',
  type: 'collection',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['buildTransaction'],
    },
  },
  default: {},
  typeOptions: {
    multipleValues: true,
  },
  options: [
    {
      displayName: 'Address',
      name: 'address',
      type: 'string',
      default: '',
      description: 'Recipient address',
    },
    {
      displayName: 'Amount',
      name: 'amount',
      type: 'number',
      default: 0,
      description: 'Amount to send (in base units)',
    },
  ],
  description: 'List of recipients',
},
{
  displayName: 'Fee Rate',
  name: 'feeRate',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['buildTransaction'],
    },
  },
  default: 10000,
  description: 'Fee rate in satoshis per kilobyte',
},
{
  displayName: 'Min Confirms',
  name: 'minConfirms',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['buildTransaction'],
    },
  },
  default: 1,
  description: 'Minimum confirmations for inputs',
},
{
  displayName: 'Transaction Hex',
  name: 'txHex',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendTransaction', 'signTransaction'],
    },
  },
  default: '',
  description: 'The transaction hex string',
},
{
  displayName: 'Half Signed',
  name: 'halfSigned',
  type: 'json',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendTransaction'],
    },
  },
  default: '{}',
  description: 'Half signed transaction object',
},
{
  displayName: 'Comment',
  name: 'comment',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['sendTransaction'],
    },
  },
  default: '',
  description: 'Comment for the transaction',
},
{
  displayName: 'Transaction Prebuild',
  name: 'txPrebuild',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['signTransaction'],
    },
  },
  default: '{}',
  description: 'Transaction prebuild object',
},
{
  displayName: 'Private Key',
  name: 'prv',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['signTransaction'],
    },
  },
  typeOptions: {
    password: true,
  },
  default: '',
  description: 'Private key for signing',
},
{
  displayName: 'Address',
  name: 'address',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: '',
  description: 'The destination address',
},
{
  displayName: 'Amount',
  name: 'amount',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: 0,
  description: 'The amount to send in base units',
},
{
  displayName: 'Wallet Passphrase',
  name: 'walletPassphrase',
  type: 'string',
  typeOptions: {
    password: true,
  },
  required: true,
  displayOptions: {
    show: {
      resource: ['transaction'],
      operation: ['createTransaction'],
    },
  },
  default: '',
  description: 'The wallet passphrase for signing',
},
{
	displayName: 'Coin',
	name: 'coin',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer', 'getTransfer', 'listTransfers', 'updateTransfer', 'cancelTransfer'],
		},
	},
	default: 'btc',
	placeholder: 'btc, eth, ltc, etc.',
	description: 'The cryptocurrency identifier',
},
{
	displayName: 'Wallet ID',
	name: 'walletId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer', 'getTransfer', 'listTransfers', 'updateTransfer', 'cancelTransfer'],
		},
	},
	default: '',
	description: 'The wallet ID',
},
{
	displayName: 'Transfer ID',
	name: 'transferId',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['getTransfer', 'updateTransfer', 'cancelTransfer'],
		},
	},
	default: '',
	description: 'The transfer ID',
},
{
	displayName: 'Recipient Address',
	name: 'address',
	type: 'string',
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer'],
		},
	},
	default: '',
	description: 'The recipient wallet address',
},
{
	displayName: 'Amount',
	name: 'amount',
	type: 'number',
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer'],
		},
	},
	default: 0,
	description: 'The amount to transfer (in base units)',
},
{
	displayName: 'Wallet Passphrase',
	name: 'walletPassphrase',
	type: 'string',
	typeOptions: {
		password: true,
	},
	required: true,
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer'],
		},
	},
	default: '',
	description: 'The wallet passphrase for transaction signing',
},
{
	displayName: 'State',
	name: 'state',
	type: 'options',
	options: [
		{ name: 'All', value: '' },
		{ name: 'Pending', value: 'pending' },
		{ name: 'Confirmed', value: 'confirmed' },
		{ name: 'Failed', value: 'failed' },
		{ name: 'Rejected', value: 'rejected' },
	],
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['listTransfers'],
		},
	},
	default: '',
	description: 'Filter transfers by state',
},
{
	displayName: 'Transfer State',
	name: 'transferState',
	type: 'options',
	required: true,
	options: [
		{ name: 'Accepted', value: 'accepted' },
		{ name: 'Rejected', value: 'rejected' },
	],
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['updateTransfer'],
		},
	},
	default: 'accepted',
	description: 'The new state for the transfer',
},
{
	displayName: 'Limit',
	name: 'limit',
	type: 'number',
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['listTransfers'],
		},
	},
	default: 25,
	description: 'Maximum number of results to return',
},
{
	displayName: 'Additional Fields',
	name: 'additionalFields',
	type: 'collection',
	placeholder: 'Add Field',
	default: {},
	displayOptions: {
		show: {
			resource: ['transfer'],
			operation: ['createTransfer'],
		},
	},
	options: [
		{
			displayName: 'Fee Rate',
			name: 'feeRate',
			type: 'number',
			default: 0,
			description: 'Fee rate for the transaction',
		},
		{
			displayName: 'Comment',
			name: 'comment',
			type: 'string',
			default: '',
			description: 'Comment for the transfer',
		},
		{
			displayName: 'Target Wallet ID',
			name: 'targetWalletId',
			type: 'string',
			default: '',
			description: 'Target wallet ID for internal transfers',
		},
	],
},
{
  displayName: 'Source',
  name: 'source',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['createKeychain']
    }
  },
  default: '',
  description: 'Source for keychain generation',
},
{
  displayName: 'Entropy',
  name: 'entropy',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['createKeychain']
    }
  },
  default: '',
  description: 'Optional entropy for keychain generation',
},
{
  displayName: 'Public Key',
  name: 'pub',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['getKeychain', 'updateKeychain']
    }
  },
  default: '',
  description: 'Public key of the keychain',
},
{
  displayName: 'Encrypted Private Key',
  name: 'encryptedPrv',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['updateKeychain']
    }
  },
  default: '',
  description: 'Encrypted private key to update',
},
{
  displayName: 'Coin',
  name: 'coin',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['consolidateUnspents', 'listUnspents']
    }
  },
  options: [
    { name: 'Bitcoin', value: 'btc' },
    { name: 'Bitcoin Testnet', value: 'tbtc' },
    { name: 'Ethereum', value: 'eth' },
    { name: 'Ethereum Testnet', value: 'teth' },
    { name: 'Litecoin', value: 'ltc' },
    { name: 'Litecoin Testnet', value: 'tltc' }
  ],
  default: 'btc',
  description: 'The cryptocurrency to operate on',
},
{
  displayName: 'Minimum Value',
  name: 'minValue',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['key'],
      operation: ['listUnspents']
    }
  },
  default: 0,
  description: 'Minimum value of unspent outputs to include',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['listPendingApprovals'],
    },
  },
  type: 'string',
  default: '',
  description: 'Filter by wallet ID',
},
{
  displayName: 'Enterprise',
  name: 'enterprise',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['listPendingApprovals'],
    },
  },
  default: '',
  description: 'Filter by enterprise ID',
},
{
  displayName: 'State',
  name: 'state',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['listPendingApprovals'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: 'pending',
    },
    {
      name: 'Approved',
      value: 'approved',
    },
    {
      name: 'Rejected',
      value: 'rejected',
    },
    {
      name: 'All',
      value: 'all',
    },
  ],
  default: 'pending',
  description: 'Filter by approval state',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['listPendingApprovals'],
    },
  },
  default: 25,
  description: 'Maximum number of results to return',
  typeOptions: {
    minValue: 1,
    maxValue: 500,
  },
},
{
  displayName: 'Approval ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['getPendingApproval', 'updateApprovalState', 'constructApprovalTransaction', 'cancelPendingApproval'],
    },
  },
  default: '',
  description: 'ID of the pending approval',
},
{
  displayName: 'State',
  name: 'approvalState',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['updateApprovalState'],
    },
  },
  options: [
    {
      name: 'Approved',
      value: 'approved',
    },
    {
      name: 'Rejected',
      value: 'rejected',
    },
  ],
  default: 'approved',
  description: 'New state for the pending approval',
},
{
  displayName: 'OTP',
  name: 'otp',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['updateApprovalState'],
    },
  },
  default: '',
  description: 'One-time password for approval (if required)',
},
{
  displayName: 'Recipients',
  name: 'recipients',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['constructApprovalTransaction'],
    },
  },
  default: '[]',
  description: 'Array of recipient objects with address and amount',
},
{
  displayName: 'Fee Rate',
  name: 'feeRate',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['pendingApproval'],
      operation: ['constructApprovalTransaction'],
    },
  },
  default: 0,
  description: 'Fee rate for the transaction (satoshis per byte)',
  typeOptions: {
    minValue: 0,
  },
},
{
  displayName: 'Coin',
  name: 'coin',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['webhook'],
    },
  },
  default: 'btc',
  description: 'The cryptocurrency coin symbol (e.g., btc, eth, ltc)',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['webhook'],
    },
  },
  default: '',
  description: 'The wallet ID',
},
{
  displayName: 'All Tokens',
  name: 'allTokens',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['listWebhooks'],
    },
  },
  default: false,
  description: 'Whether to include all token webhooks',
},
{
  displayName: 'Webhook ID',
  name: 'webhookId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['getWebhook', 'updateWebhook', 'removeWebhook', 'simulateWebhook', 'deleteWebhook'],
    },
  },
  default: '',
  description: 'The webhook ID',
},
{
  displayName: 'Type',
  name: 'type',
  type: 'options',
  required: true,
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['createWebhook', 'updateWebhook'],
    },
  },
  options: [
    {
      name: 'Transaction',
      value: 'transaction',
    },
    {
      name: 'Transfer',
      value: 'transfer',
    },
    {
      name: 'Address Confirmation',
      value: 'address_confirmation',
    },
    {
      name: 'Pending Approval',
      value: 'pendingapproval',
    },
  ],
  default: 'transaction',
  description: 'The type of webhook',
},
{
  displayName: 'URL',
  name: 'url',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['createWebhook', 'updateWebhook'],
    },
  },
  default: '',
  description: 'The webhook URL endpoint',
},
{
  displayName: 'Label',
  name: 'label',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['createWebhook', 'updateWebhook'],
    },
  },
  default: '',
  description: 'A label for the webhook',
},
{
  displayName: 'Transaction Hash',
  name: 'txHash',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['simulateWebhook'],
    },
  },
  default: '',
  description: 'Transaction hash for webhook simulation',
},
{
  displayName: 'Webhook ID for Simulation',
  name: 'simulationWebhookId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['webhook'],
      operation: ['simulateWebhook'],
    },
  },
  default: '',
  description: 'Webhook ID for simulation payload',
},
{
  displayName: 'Enterprise ID',
  name: 'enterpriseId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['getEnterprise', 'updateEnterprise', 'getEnterpriseUsers', 'addEnterpriseUser', 'removeEnterpriseUser', 'getEnterpriseWallets'],
    },
  },
  default: '',
  description: 'The enterprise ID',
},
{
  displayName: 'Name',
  name: 'name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['updateEnterprise'],
    },
  },
  default: '',
  description: 'The enterprise name',
},
{
  displayName: 'Emergency Phone',
  name: 'emergencyPhone',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['updateEnterprise'],
    },
  },
  default: '',
  description: 'The emergency phone number',
},
{
  displayName: 'Allow Inactive Admins',
  name: 'allowInactiveAdmins',
  type: 'boolean',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['getEnterpriseUsers'],
    },
  },
  default: false,
  description: 'Whether to include inactive admins in the response',
},
{
  displayName: 'Username',
  name: 'username',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['addEnterpriseUser'],
    },
  },
  default: '',
  description: 'Username to add to enterprise',
},
{
  displayName: 'Usernames',
  name: 'usernames',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['addEnterpriseUser'],
    },
  },
  default: '',
  description: 'Comma-separated list of usernames to add to enterprise',
},
{
  displayName: 'Permission',
  name: 'permission',
  type: 'options',
  options: [
    {
      name: 'Admin',
      value: 'admin',
    },
    {
      name: 'View Only',
      value: 'view',
    },
  ],
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['addEnterpriseUser'],
    },
  },
  default: 'view',
  description: 'Permission level for the user',
},
{
  displayName: 'User ID',
  name: 'userId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['removeEnterpriseUser'],
    },
  },
  default: '',
  description: 'The user ID to remove from enterprise',
},
{
  displayName: 'Coin',
  name: 'coin',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['getEnterpriseWallets'],
    },
  },
  default: '',
  description: 'Filter wallets by coin type',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['enterprise'],
      operation: ['getEnterpriseWallets'],
    },
  },
  default: 25,
  description: 'Maximum number of wallets to return',
},
{
  displayName: 'Coin',
  name: 'coin',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['getWalletPolicy', 'updateWalletPolicy', 'addPolicyRule', 'removePolicyRule'],
    },
  },
  default: 'btc',
  description: 'The cryptocurrency coin type (e.g., btc, eth, ltc)',
},
{
  displayName: 'Wallet ID',
  name: 'walletId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['getWalletPolicy', 'updateWalletPolicy', 'addPolicyRule', 'removePolicyRule'],
    },
  },
  default: '',
  description: 'The wallet ID',
},
{
  displayName: 'Enterprise ID',
  name: 'enterpriseId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['getEnterprisePolicy', 'updateEnterprisePolicy'],
    },
  },
  default: '',
  description: 'The enterprise ID',
},
{
  displayName: 'Rules',
  name: 'rules',
  type: 'json',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['updateWalletPolicy', 'updateEnterprisePolicy'],
    },
  },
  default: '[]',
  description: 'Array of policy rules to apply',
},
{
  displayName: 'Action',
  name: 'action',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['updateWalletPolicy', 'addPolicyRule'],
    },
  },
  default: '',
  description: 'The action to take when rule conditions are met',
},
{
  displayName: 'Condition',
  name: 'condition',
  type: 'json',
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['updateWalletPolicy', 'addPolicyRule'],
    },
  },
  default: '{}',
  description: 'The conditions that trigger the policy rule',
},
{
  displayName: 'Rule ID',
  name: 'id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['addPolicyRule'],
    },
  },
  default: '',
  description: 'Unique identifier for the policy rule',
},
{
  displayName: 'Rule Type',
  name: 'type',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['addPolicyRule'],
    },
  },
  default: '',
  description: 'The type of policy rule (e.g., velocity, whitelist, amount)',
},
{
  displayName: 'Rule ID',
  name: 'ruleId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['policy'],
      operation: ['removePolicyRule'],
    },
  },
  default: '',
  description: 'The ID of the policy rule to remove',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'wallet':
        return [await executeWalletOperations.call(this, items)];
      case 'address':
        return [await executeAddressOperations.call(this, items)];
      case 'transaction':
        return [await executeTransactionOperations.call(this, items)];
      case 'transfer':
        return [await executeTransferOperations.call(this, items)];
      case 'key':
        return [await executeKeyOperations.call(this, items)];
      case 'pendingApproval':
        return [await executePendingApprovalOperations.call(this, items)];
      case 'webhook':
        return [await executeWebhookOperations.call(this, items)];
      case 'enterprise':
        return [await executeEnterpriseOperations.call(this, items)];
      case 'policy':
        return [await executePolicyOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeWalletOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('bitgoApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'listWallets': {
          const coin = this.getNodeParameter('coin', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const prevId = this.getNodeParameter('prevId', i) as string;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (prevId) queryParams.prevId = prevId;

          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString()
            : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/wallets${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createWallet': {
          const coin = this.getNodeParameter('coin', i) as string;
          const label = this.getNodeParameter('label', i) as string;
          const passphrase = this.getNodeParameter('passphrase', i) as string;
          const userKey = this.getNodeParameter('userKey', i) as string;
          const backupXpub = this.getNodeParameter('backupXpub', i) as string;
          const enterprise = this.getNodeParameter('enterprise', i) as string;

          const body: any = {
            label,
            passphrase,
          };

          if (userKey) body.userKey = userKey;
          if (backupXpub) body.backupXpub = backupXpub;
          if (enterprise) body.enterprise = enterprise;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/${coin}/wallet`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getWallet': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'updateWallet': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;
          const updateLabel = this.getNodeParameter('updateLabel', i) as string;
          const approvalsRequired = this.getNodeParameter('approvalsRequired', i) as number;

          const body: any = {};
          if (updateLabel) body.label = updateLabel;
          if (approvalsRequired !== undefined) body.approvalsRequired = approvalsRequired;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'deleteWallet': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;

          const options: any = {
            method: 'DELETE',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getWalletAddresses': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const mine = this.getNodeParameter('mine', i) as boolean;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (mine) queryParams.mine = mine;

          const queryString = Object.keys(queryParams).length > 0 
            ? '?' + new URLSearchParams(queryParams).toString()
            : '';

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}/addresses${queryString}`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'createAddress': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;
          const chain = this.getNodeParameter('chain', i) as number;
          const addressLabel = this.getNodeParameter('addressLabel', i) as string;

          const body: any = {};
          if (chain !== undefined) body.chain = chain;
          if (addressLabel) body.label = addressLabel;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}/address`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body,
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'freezeWallet': {
          const coin = this.getNodeParameter('coin', i) as string;
          const walletId = this.getNodeParameter('walletId', i) as string;
          const duration = this.getNodeParameter('duration', i) as number;

          const options: any = {
            method: 'POST',
            url: `${credentials.baseUrl}/${coin}/wallet/${walletId}/freeze`,
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: { duration },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          paired