/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

import { bitgoCoinApiRequest } from './transport';
import { SUPPORTED_COINS, TESTNET_COINS, WEBHOOK_TYPES } from './constants';
import { logLicensingNotice } from './transport';

/**
 * BitGo Trigger node for webhook-based real-time notifications
 * Receives events from BitGo for transfers, transactions, approvals, etc.
 */
export class BitGoTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'BitGo Trigger',
    name: 'bitGoTrigger',
    icon: 'file:bitgo.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when BitGo events occur',
    defaults: {
      name: 'BitGo Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'bitGoApi',
        required: true,
      },
    ],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
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
        description: 'The cryptocurrency to monitor',
      },
      {
        displayName: 'Wallet ID',
        name: 'walletId',
        type: 'string',
        required: true,
        default: '',
        description: 'The wallet ID to receive events for',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        options: WEBHOOK_TYPES.map((type) => ({
          name: type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          value: type,
          description: getEventDescription(type),
        })),
        default: 'transfer',
        description: 'The event type to listen for',
      },
      {
        displayName: 'Confirmations',
        name: 'numConfirmations',
        type: 'number',
        default: 0,
        description: 'Number of confirmations before triggering (0 for unconfirmed)',
        displayOptions: {
          show: {
            event: ['transfer', 'transaction'],
          },
        },
      },
      {
        displayName: 'Listen to Failure States',
        name: 'listenToFailureStates',
        type: 'boolean',
        default: false,
        description: 'Whether to also trigger on failed transactions',
        displayOptions: {
          show: {
            event: ['transfer', 'transaction'],
          },
        },
      },
      {
        displayName: 'All Tokens',
        name: 'allToken',
        type: 'boolean',
        default: false,
        description: 'Whether to receive events for all tokens on this wallet',
        displayOptions: {
          show: {
            event: ['transfer'],
          },
        },
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const coin = this.getNodeParameter('coin') as string;
        const walletId = this.getNodeParameter('walletId') as string;
        const event = this.getNodeParameter('event') as string;

        try {
          const response = await bitgoCoinApiRequest.call(
            this,
            'GET',
            coin,
            `/wallet/${walletId}/webhooks`,
          );

          const webhooks = (response as { webhooks?: IDataObject[] }).webhooks || [];

          for (const webhook of webhooks) {
            if (webhook.url === webhookUrl && webhook.type === event) {
              // Store webhook ID for deletion
              const webhookData = this.getWorkflowStaticData('node');
              webhookData.webhookId = webhook.id;
              return true;
            }
          }

          return false;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        logLicensingNotice();

        const webhookUrl = this.getNodeWebhookUrl('default');
        const coin = this.getNodeParameter('coin') as string;
        const walletId = this.getNodeParameter('walletId') as string;
        const event = this.getNodeParameter('event') as string;

        const body: IDataObject = {
          type: event,
          url: webhookUrl,
        };

        // Add optional parameters based on event type
        if (event === 'transfer' || event === 'transaction') {
          const numConfirmations = this.getNodeParameter('numConfirmations', 0) as number;
          if (numConfirmations > 0) {
            body.numConfirmations = numConfirmations;
          }

          const listenToFailureStates = this.getNodeParameter(
            'listenToFailureStates',
            false,
          ) as boolean;
          if (listenToFailureStates) {
            body.listenToFailureStates = true;
          }
        }

        if (event === 'transfer') {
          const allToken = this.getNodeParameter('allToken', false) as boolean;
          if (allToken) {
            body.allToken = true;
          }
        }

        try {
          const response = await bitgoCoinApiRequest.call(
            this,
            'POST',
            coin,
            `/wallet/${walletId}/webhooks`,
            body,
          );

          const webhookData = this.getWorkflowStaticData('node');
          webhookData.webhookId = (response as IDataObject).id;

          return true;
        } catch (error) {
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookId = webhookData.webhookId as string;

        if (!webhookId) {
          return true;
        }

        const coin = this.getNodeParameter('coin') as string;
        const walletId = this.getNodeParameter('walletId') as string;
        const event = this.getNodeParameter('event') as string;

        try {
          await bitgoCoinApiRequest.call(this, 'DELETE', coin, `/wallet/${walletId}/webhooks`, {
            type: event,
            url: this.getNodeWebhookUrl('default'),
          });

          delete webhookData.webhookId;
          return true;
        } catch {
          return false;
        }
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();

    // Validate webhook payload
    if (!bodyData || typeof bodyData !== 'object') {
      return {
        workflowData: [this.helpers.returnJsonArray([{ error: 'Invalid webhook payload' }])],
      };
    }

    // Add metadata about the event
    const eventData: IDataObject = {
      ...bodyData,
      _receivedAt: new Date().toISOString(),
      _webhookPath: this.getNodeWebhookUrl('default'),
    };

    return {
      workflowData: [this.helpers.returnJsonArray([eventData])],
    };
  }
}

/**
 * Get description for webhook event type
 */
function getEventDescription(type: string): string {
  const descriptions: Record<string, string> = {
    transfer: 'Triggers when transfers occur (incoming/outgoing)',
    transaction: 'Triggers on transaction events',
    pendingapproval: 'Triggers when a pending approval is created',
    address_confirmation: 'Triggers when an address receives its first transaction',
    block: 'Triggers when a new block is mined',
    wallet_confirmation: 'Triggers when wallet reaches confirmation threshold',
  };
  return descriptions[type] || 'Triggers on this event type';
}
