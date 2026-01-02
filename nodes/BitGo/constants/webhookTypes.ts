/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * BitGo Webhook Types (as array for iteration)
 */
export const WEBHOOK_TYPES: readonly string[] = [
  'transfer',
  'transaction',
  'pendingapproval',
  'address_confirmation',
  'block',
  'wallet_confirmation',
] as const;

export type WebhookType = (typeof WEBHOOK_TYPES)[number];

/**
 * Webhook type options for n8n dropdown fields
 */
export const WEBHOOK_TYPE_OPTIONS = [
  {
    name: 'Transfer',
    value: 'transfer',
    description: 'Any incoming or outgoing transfer',
  },
  {
    name: 'Transaction',
    value: 'transaction',
    description: 'Transaction state changes',
  },
  {
    name: 'Pending Approval',
    value: 'pendingapproval',
    description: 'Transaction awaiting approval',
  },
  {
    name: 'Address Confirmation',
    value: 'address_confirmation',
    description: 'Address has been funded',
  },
  {
    name: 'Block',
    value: 'block',
    description: 'New block mined on network',
  },
  {
    name: 'Wallet Confirmation',
    value: 'wallet_confirmation',
    description: 'Wallet activity confirmed',
  },
] as const;

/**
 * Pending Approval States (as array for iteration)
 */
export const PENDING_APPROVAL_STATES: readonly string[] = [
  'pending',
  'approved',
  'rejected',
  'canceled',
] as const;

export type PendingApprovalState = (typeof PENDING_APPROVAL_STATES)[number];

/**
 * Pending Approval State options for n8n dropdown fields
 */
export const PENDING_APPROVAL_STATE_OPTIONS = [
  {
    name: 'Pending',
    value: 'pending',
    description: 'Awaiting approval decision',
  },
  {
    name: 'Approved',
    value: 'approved',
    description: 'Request has been approved',
  },
  {
    name: 'Rejected',
    value: 'rejected',
    description: 'Request has been rejected',
  },
  {
    name: 'Canceled',
    value: 'canceled',
    description: 'Request has been canceled',
  },
] as const;

/**
 * Transaction confirmation states
 */
export const CONFIRMATION_STATES = {
  unconfirmed: 'unconfirmed',
  confirmed: 'confirmed',
  failed: 'failed',
} as const;

export type ConfirmationState = (typeof CONFIRMATION_STATES)[keyof typeof CONFIRMATION_STATES];
