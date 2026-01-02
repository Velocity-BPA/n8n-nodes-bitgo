/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * BitGo API Types
 * Comprehensive TypeScript type definitions for BitGo REST API v2
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * BitGo API credentials interface
 */
export interface IBitGoCredentials {
  accessToken: string;
  environment: 'production' | 'test';
  enterpriseId?: string;
  walletPassphrase?: string;
}

/**
 * Pagination parameters for list operations
 */
export interface IPaginationParams {
  limit?: number;
  prevId?: string;
  allTokens?: boolean;
}

/**
 * Standard paginated response wrapper
 */
export interface IPaginatedResponse<T> {
  coin: string;
  totalCount?: number;
  nextBatchPrevId?: string;
  [key: string]: T[] | string | number | undefined;
}

// ============================================================================
// Wallet Types
// ============================================================================

/**
 * BitGo Wallet
 */
export interface IWallet {
  id: string;
  coin: string;
  label: string;
  enterprise?: string;
  balance: number;
  balanceString: string;
  confirmedBalance: number;
  confirmedBalanceString: string;
  spendableBalance: number;
  spendableBalanceString: string;
  pendingApprovals?: IPendingApproval[];
  receiveAddress?: IAddress;
  isCold?: boolean;
  custodialWallet?: boolean;
  keys: string[];
  coinSpecific?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  approvalsRequired?: number;
  m?: number;
  n?: number;
}

/**
 * Create wallet parameters
 */
export interface ICreateWalletParams {
  label: string;
  passphrase: string;
  userKey?: string;
  backupXpub?: string;
  backupXpubProvider?: string;
  enterprise?: string;
  disableTransactionNotifications?: boolean;
  gasPrice?: number;
  walletVersion?: number;
  m?: number;
  n?: number;
  type?: 'hot' | 'cold' | 'custodial';
}

/**
 * Update wallet parameters
 */
export interface IUpdateWalletParams {
  label?: string;
  approvalsRequired?: number;
  disableTransactionNotifications?: boolean;
}

/**
 * Maximum spendable response
 */
export interface IMaxSpendable {
  coin: string;
  maximumSpendable: string;
  maximumSpendableWithoutReserve?: string;
  feeBalance?: string;
  reserve?: string;
}

// ============================================================================
// Address Types
// ============================================================================

/**
 * BitGo Address
 */
export interface IAddress {
  id: string;
  address: string;
  chain: number;
  index: number;
  coin: string;
  wallet: string;
  label?: string;
  balance: number;
  balanceString: string;
  coinSpecific?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create address parameters
 */
export interface ICreateAddressParams {
  chain?: number;
  label?: string;
  gasPrice?: number;
  forwarderVersion?: number;
  onToken?: string;
}

/**
 * Address verification result
 */
export interface IAddressVerification {
  isValid: boolean;
  address: string;
  normalizedAddress?: string;
}

// ============================================================================
// Transaction Types
// ============================================================================

/**
 * BitGo Transaction
 */
export interface ITransaction {
  id: string;
  txid: string;
  coin: string;
  wallet: string;
  normalizedTxHash?: string;
  blockHash?: string;
  blockHeight?: number;
  date: string;
  confirmations: number;
  fee: number;
  feeString: string;
  usd?: number;
  usdRate?: number;
  state: 'unconfirmed' | 'confirmed' | 'failed' | 'rejected';
  type: string;
  entries: ITransactionEntry[];
  inputs?: ITransactionInput[];
  outputs?: ITransactionOutput[];
  coinSpecific?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Transaction entry
 */
export interface ITransactionEntry {
  address: string;
  wallet: string;
  value: number;
  valueString: string;
  inputs?: number;
  outputs?: number;
  isChange?: boolean;
  isPayGo?: boolean;
  token?: string;
}

/**
 * Transaction input (UTXO)
 */
export interface ITransactionInput {
  id: string;
  address: string;
  value: number;
  valueString: string;
  chain?: number;
  index?: number;
  redeemScript?: string;
  witnessScript?: string;
  coinSpecific?: Record<string, unknown>;
}

/**
 * Transaction output
 */
export interface ITransactionOutput {
  id: string;
  address: string;
  value: number;
  valueString: string;
  chain?: number;
  index?: number;
  isChange?: boolean;
  coinSpecific?: Record<string, unknown>;
}

/**
 * Create transaction parameters
 */
export interface ICreateTransactionParams {
  recipients: IRecipient[];
  walletPassphrase?: string;
  comment?: string;
  memo?: string;
  feeRate?: number;
  feeMultiplier?: number;
  minConfirms?: number;
  enforceMinConfirmsForChange?: boolean;
  maxFeeRate?: number;
  instant?: boolean;
  sequenceId?: string;
  nonce?: number;
  unspents?: string[];
  changeAddress?: string;
  noSplitChange?: boolean;
}

/**
 * Send transaction parameters
 */
export interface ISendTransactionParams extends ICreateTransactionParams {
  otp?: string;
  halfSigned?: {
    txHex?: string;
    payload?: string;
    txBase64?: string;
  };
}

/**
 * Recipient for transaction
 */
export interface IRecipient {
  address: string;
  amount: string | number;
  data?: string;
  tokenData?: {
    tokenContractAddress?: string;
    tokenQuantity?: string;
  };
}

/**
 * Fee estimate response
 */
export interface IFeeEstimate {
  feePerKb: number;
  cpfpFeePerKb?: number;
  numBlocks: number;
  confidence?: number;
  multiplier?: number;
  feeByBlockTarget?: Record<string, number>;
}

// ============================================================================
// Transfer Types
// ============================================================================

/**
 * BitGo Transfer
 */
export interface ITransfer {
  id: string;
  coin: string;
  wallet: string;
  txid: string;
  height?: number;
  heightId?: string;
  date: string;
  type: 'send' | 'receive';
  value: number;
  valueString: string;
  usdValue?: number;
  usdRate?: number;
  baseValue?: number;
  baseValueString?: string;
  feeString?: string;
  payGoFee?: number;
  payGoFeeString?: string;
  confirmedTime?: string;
  unconfirmedTime?: string;
  state: 'confirmed' | 'unconfirmed' | 'failed' | 'rejected' | 'pendingApproval';
  entries: ITransferEntry[];
  comment?: string;
  sequenceId?: string;
  coinSpecific?: Record<string, unknown>;
  vout?: number;
  confirmations?: number;
}

/**
 * Transfer entry
 */
export interface ITransferEntry {
  address: string;
  wallet?: string;
  value: number;
  valueString: string;
  inputs?: number;
  outputs?: number;
  isChange?: boolean;
  isPayGo?: boolean;
  token?: string;
}

// ============================================================================
// Key Types
// ============================================================================

/**
 * BitGo Key
 */
export interface IKey {
  id: string;
  pub: string;
  ethAddress?: string;
  source: 'user' | 'backup' | 'bitgo';
  encryptedPrv?: string;
  coinSpecific?: Record<string, unknown>;
  isBitGo?: boolean;
  enterprise?: string;
}

/**
 * Create key parameters
 */
export interface ICreateKeyParams {
  pub?: string;
  encryptedPrv?: string;
  source?: 'user' | 'backup' | 'bitgo';
  enterprise?: string;
  newFeeAddress?: boolean;
  originalPasscodeEncryptionCode?: string;
}

/**
 * Keychain response
 */
export interface IKeychain {
  id: string;
  pub: string;
  encryptedPrv?: string;
  ethAddress?: string;
  source: string;
  coinSpecific?: Record<string, unknown>;
}

// ============================================================================
// Pending Approval Types
// ============================================================================

/**
 * BitGo Pending Approval
 */
export interface IPendingApproval {
  id: string;
  coin: string;
  wallet: string;
  enterprise?: string;
  creator: string;
  createDate: string;
  state: 'pending' | 'approved' | 'rejected' | 'canceled';
  type: string;
  info: IPendingApprovalInfo;
  scope: string[];
  approvalsRequired: number;
  resolvers?: IApprovalResolver[];
  userIds?: string[];
}

/**
 * Pending approval info
 */
export interface IPendingApprovalInfo {
  type: string;
  transactionRequest?: {
    requestedAmount?: string;
    fee?: string;
    recipients?: IRecipient[];
    buildParams?: Record<string, unknown>;
  };
  policyRuleRequest?: {
    update?: {
      id?: string;
      action?: string;
      condition?: Record<string, unknown>;
    };
  };
}

/**
 * Approval resolver
 */
export interface IApprovalResolver {
  date: string;
  user: string;
  resolution: 'approved' | 'rejected';
}

/**
 * Update pending approval parameters
 */
export interface IUpdatePendingApprovalParams {
  state: 'approved' | 'rejected';
  otp?: string;
  walletPassphrase?: string;
}

// ============================================================================
// Policy Types
// ============================================================================

/**
 * BitGo Policy
 */
export interface IPolicy {
  id: string;
  coin: string;
  date: string;
  label: string;
  version: number;
  latest: boolean;
  rules: IPolicyRule[];
}

/**
 * Policy rule
 */
export interface IPolicyRule {
  id: string;
  coin: string;
  type: string;
  action: IPolicyAction;
  condition: IPolicyCondition;
}

/**
 * Policy action
 */
export interface IPolicyAction {
  type: 'deny' | 'getApproval';
  approvalsRequired?: number;
  userIds?: string[];
}

/**
 * Policy condition
 */
export interface IPolicyCondition {
  amountString?: string;
  timeWindow?: number;
  groupTags?: string[];
  excludeTags?: string[];
  velocityLimitPolicy?: {
    window?: number;
    coin?: string;
    amount?: string;
  };
}

/**
 * Create policy parameters
 */
export interface ICreatePolicyParams {
  type: string;
  action: IPolicyAction;
  condition: IPolicyCondition;
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * BitGo Webhook
 */
export interface IWebhook {
  id: string;
  coin: string;
  wallet?: string;
  enterprise?: string;
  type: string;
  url: string;
  label?: string;
  numConfirmations?: number;
  state?: string;
  listenToFailureStates?: boolean;
  allToken?: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create webhook parameters
 */
export interface ICreateWebhookParams {
  type: string;
  url: string;
  label?: string;
  numConfirmations?: number;
  listenToFailureStates?: boolean;
  allToken?: boolean;
}

/**
 * Webhook notification
 */
export interface IWebhookNotification {
  id: string;
  webhook: string;
  type: string;
  state: string;
  date: string;
  url: string;
  hash?: string;
  transfer?: string;
  coin?: string;
  wallet?: string;
  retries?: number;
  lastAttempt?: string;
  failureMessage?: string;
}

/**
 * Webhook payload for incoming webhooks
 */
export interface IWebhookPayload {
  type: string;
  hash?: string;
  transfer?: string;
  wallet?: string;
  coin?: string;
  pendingApprovalId?: string;
  state?: string;
  [key: string]: unknown;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * BitGo User
 */
export interface IUser {
  id: string;
  username: string;
  name?: {
    first?: string;
    last?: string;
    full?: string;
  };
  email?: {
    email: string;
    verified?: boolean;
  };
  phone?: {
    phone: string;
    verified?: boolean;
  };
  country?: string;
  timezone?: string;
  isActive?: boolean;
  ecdhKeychain?: string;
  forceResetPassword?: boolean;
  agreements?: Record<string, unknown>;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Update user parameters
 */
export interface IUpdateUserParams {
  name?: {
    first?: string;
    last?: string;
  };
  phone?: string;
  timezone?: string;
}

// ============================================================================
// Enterprise Types
// ============================================================================

/**
 * BitGo Enterprise
 */
export interface IEnterprise {
  id: string;
  name: string;
  primaryContact?: string;
  emergencyPhone?: string;
  approvalsRequired?: number;
  freeze?: {
    time?: string;
    expires?: string;
  };
  bitgoOrg?: string;
  bitgoEthKey?: string;
  ethFeeAddress?: string;
  mutablePolicyWindow?: number;
  canCreateColdWallet?: boolean;
  canCreateHotWallet?: boolean;
  canCreateCustodialWallet?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Enterprise user
 */
export interface IEnterpriseUser {
  user: IUser;
  permissions: string[];
}

/**
 * Fee wallet balance
 */
export interface IFeeWallet {
  coin: string;
  balance: number;
  balanceString: string;
  address?: string;
}

// ============================================================================
// Coin Types
// ============================================================================

/**
 * BitGo Coin
 */
export interface ICoin {
  id: string;
  name: string;
  coin: string;
  decimalPlaces: number;
  network: string;
  features: string[];
  maxFee?: string;
  maxFeeRate?: string;
  minOutputSize?: string;
  supportsBatchTransactions?: boolean;
  supportsStaking?: boolean;
  addresses?: {
    default?: string;
    bech32?: string;
  };
}

/**
 * Market data
 */
export interface IMarketData {
  coin: string;
  currencies: {
    [currency: string]: {
      last: number;
      bid: number;
      ask: number;
      volume: number;
      timestamp: number;
    };
  };
}

// ============================================================================
// Staking Types
// ============================================================================

/**
 * Staking wallet info
 */
export interface IStakingWallet {
  walletId: string;
  coin: string;
  stakedBalance: string;
  pendingRewards: string;
  totalRewards: string;
  activeStakes: IStake[];
}

/**
 * Stake details
 */
export interface IStake {
  id: string;
  wallet: string;
  coin: string;
  amount: string;
  status: 'active' | 'pending' | 'unstaking' | 'completed';
  validator?: string;
  startDate: string;
  endDate?: string;
  rewards?: string;
}

/**
 * Create staking request parameters
 */
export interface ICreateStakingParams {
  amount: string;
  validator?: string;
  walletPassphrase?: string;
}

/**
 * Staking reward
 */
export interface IStakingReward {
  id: string;
  wallet: string;
  coin: string;
  amount: string;
  date: string;
  validator?: string;
  epoch?: number;
}

// ============================================================================
// Unspent Types (UTXO)
// ============================================================================

/**
 * Unspent output (UTXO)
 */
export interface IUnspent {
  id: string;
  address: string;
  value: number;
  valueString: string;
  blockHeight?: number;
  date?: string;
  wallet: string;
  fromWallet?: string;
  chain: number;
  index: number;
  redeemScript?: string;
  witnessScript?: string;
  isSegwit?: boolean;
  coinSpecific?: Record<string, unknown>;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic API error response
 */
export interface IBitGoError {
  error: string;
  message?: string;
  name?: string;
  requestId?: string;
  context?: Record<string, unknown>;
}

/**
 * Generic list response
 */
export interface IListResponse<T> {
  [key: string]: T[] | string | number | undefined;
  coin?: string;
  nextBatchPrevId?: string;
}

/**
 * Send result
 */
export interface ISendResult {
  transfer: ITransfer;
  txid: string;
  tx: string;
  status: string;
}

/**
 * Build transaction result
 */
export interface IBuildTransactionResult {
  txHex?: string;
  txBase64?: string;
  feeInfo?: {
    fee: number;
    feeString: string;
    feeRate?: number;
    size?: number;
  };
}
