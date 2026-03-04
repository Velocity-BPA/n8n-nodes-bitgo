/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { BitGo } from '../nodes/BitGo/BitGo.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('BitGo Node', () => {
  let node: BitGo;

  beforeAll(() => {
    node = new BitGo();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('BitGo');
      expect(node.description.name).toBe('bitgo');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Wallet Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('should list wallets successfully', async () => {
    const mockResponse = {
      wallets: [
        { id: 'wallet1', coin: 'btc', label: 'Test Wallet 1' },
        { id: 'wallet2', coin: 'btc', label: 'Test Wallet 2' },
      ],
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'listWallets';
        case 'coin': return 'btc';
        case 'limit': return 25;
        case 'prevId': return '';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/wallets?limit=25',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should create wallet successfully', async () => {
    const mockResponse = {
      id: 'new-wallet-id',
      coin: 'btc',
      label: 'New Test Wallet',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createWallet';
        case 'coin': return 'btc';
        case 'label': return 'New Test Wallet';
        case 'passphrase': return 'test-passphrase';
        case 'userKey': return '';
        case 'backupXpub': return '';
        case 'enterprise': return '';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.bitgo.com/api/v2/btc/wallets',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        label: 'New Test Wallet',
        passphrase: 'test-passphrase',
      },
      json: true,
    });
  });

  test('should get wallet successfully', async () => {
    const mockResponse = {
      id: 'test-wallet-id',
      coin: 'btc',
      label: 'Test Wallet',
      balance: 100000,
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWallet';
        case 'coin': return 'btc';
        case 'id': return 'test-wallet-id';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('should handle errors with continueOnFail true', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getWallet';
        case 'coin': return 'btc';
        case 'id': return 'invalid-wallet-id';
        default: return undefined;
      }
    });

    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Wallet not found'));

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ 
      json: { error: 'Wallet not found' }, 
      pairedItem: { item: 0 } 
    }]);
  });

  test('should create address successfully', async () => {
    const mockResponse = {
      id: 'new-address-id',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      chain: 0,
      label: 'New Address',
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'createAddress';
        case 'coin': return 'btc';
        case 'id': return 'test-wallet-id';
        case 'chain': return 0;
        case 'addressLabel': return 'New Address';
        default: return undefined;
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/address',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        chain: 0,
        label: 'New Address',
      },
      json: true,
    });
  });
});

describe('Transaction Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  test('listTransactions should retrieve wallet transactions successfully', async () => {
    const mockResponse = {
      transactions: [
        { id: 'tx1', amount: 100000, state: 'confirmed' },
        { id: 'tx2', amount: 50000, state: 'pending' }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'listTransactions';
        case 'coinType': return 'btc';
        case 'walletId': return 'test-wallet-id';
        case 'limit': return 50;
        case 'state': return 'confirmed';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/tx?limit=50&state=confirmed',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('getTransaction should retrieve transaction details successfully', async () => {
    const mockResponse = {
      id: 'tx-123',
      amount: 100000,
      state: 'confirmed',
      confirmations: 6
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'getTransaction';
        case 'coinType': return 'btc';
        case 'walletId': return 'test-wallet-id';
        case 'txId': return 'tx-123';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/tx/tx-123',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  test('buildTransaction should build unsigned transaction successfully', async () => {
    const mockResponse = {
      txHex: '0100000001...',
      txInfo: {
        changeAddresses: [],
        unspents: []
      }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'buildTransaction';
        case 'coinType': return 'btc';
        case 'walletId': return 'test-wallet-id';
        case 'recipients': return [{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: 100000 }];
        case 'feeRate': return 10000;
        case 'minConfirms': return 1;
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/tx/build',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        recipients: [{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: '100000' }],
        feeRate: 10000,
        minConfirms: 1,
      },
      json: true,
    });
  });

  test('sendTransaction should send signed transaction successfully', async () => {
    const mockResponse = {
      transfer: {
        id: 'transfer-123',
        txid: 'tx-123',
        state: 'signed'
      }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'sendTransaction';
        case 'coinType': return 'btc';
        case 'walletId': return 'test-wallet-id';
        case 'txHex': return '0100000001...';
        case 'halfSigned': return '{}';
        case 'comment': return 'Test transaction';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/tx/send',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        txHex: '0100000001...',
        comment: 'Test transaction',
      },
      json: true,
    });
  });

  test('error handling should work correctly', async () => {
    const mockError = new Error('API Error');
    
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      switch (param) {
        case 'operation': return 'listTransactions';
        case 'coinType': return 'btc';
        case 'walletId': return 'invalid-wallet-id';
        default: return '';
      }
    });

    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const result = await executeTransactionOperations.call(
      mockExecuteFunctions,
      [{ json: {} }]
    );

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('PendingApproval Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('listPendingApprovals', () => {
    it('should list pending approvals successfully', async () => {
      const mockResponse = {
        pendingApprovals: [
          { id: 'approval1', state: 'pending', walletId: 'wallet1' },
          { id: 'approval2', state: 'pending', walletId: 'wallet2' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'listPendingApprovals';
          case 'walletId': return 'wallet1';
          case 'enterprise': return '';
          case 'state': return 'pending';
          case 'limit': return 25;
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePendingApprovalOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/pendingapprovals?walletId=wallet1&state=pending&limit=25',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when listing pending approvals', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'listPendingApprovals';
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executePendingApprovalOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('API Error');
    });
  });

  describe('getPendingApproval', () => {
    it('should get pending approval details successfully', async () => {
      const mockResponse = {
        id: 'approval123',
        state: 'pending',
        walletId: 'wallet456',
        creator: 'user123',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getPendingApproval';
          case 'id': return 'approval123';
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePendingApprovalOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/pendingapprovals/approval123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('updateApprovalState', () => {
    it('should update approval state successfully', async () => {
      const mockResponse = {
        id: 'approval123',
        state: 'approved',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'updateApprovalState';
          case 'id': return 'approval123';
          case 'approvalState': return 'approved';
          case 'otp': return '123456';
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePendingApprovalOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.bitgo.com/api/v2/pendingapprovals/approval123/state',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          state: 'approved',
          otp: '123456',
        },
        json: true,
      });
    });
  });

  describe('constructApprovalTransaction', () => {
    it('should construct approval transaction successfully', async () => {
      const mockResponse = {
        txHex: '0x123456789abcdef',
        txInfo: { fee: 1000, size: 250 },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'constructApprovalTransaction';
          case 'id': return 'approval123';
          case 'recipients': return '[{"address":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa","amount":100000}]';
          case 'feeRate': return 10;
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePendingApprovalOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.bitgo.com/api/v2/pendingapprovals/approval123/constructTx',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: {
          recipients: [{ address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', amount: 100000 }],
          feeRate: 10,
        },
        json: true,
      });
    });

    it('should handle invalid recipients JSON', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'constructApprovalTransaction';
          case 'id': return 'approval123';
          case 'recipients': return 'invalid json';
          case 'feeRate': return 10;
          default: return '';
        }
      });

      await expect(
        executePendingApprovalOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow('Invalid recipients JSON');
    });
  });

  describe('cancelPendingApproval', () => {
    it('should cancel pending approval successfully', async () => {
      const mockResponse = {
        id: 'approval123',
        state: 'cancelled',
        cancelledAt: '2023-01-01T00:00:00Z',
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'cancelPendingApproval';
          case 'id': return 'approval123';
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePendingApprovalOperations.call(
        mockExecuteFunctions,
        [{ json: {} }],
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.bitgo.com/api/v2/pendingapprovals/approval123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Webhook Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('listWebhooks', () => {
    it('should list webhooks successfully', async () => {
      const mockResponse = {
        webhooks: [
          {
            id: 'webhook1',
            type: 'transaction',
            url: 'https://example.com/webhook',
            label: 'Test Webhook'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listWebhooks')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce(false);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle allTokens parameter', async () => {
      const mockResponse = { webhooks: [] };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listWebhooks')
        .mockReturnValueOnce('eth')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce(true);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/eth/wallet/wallet123/webhooks',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        qs: { allTokens: true },
      });
    });
  });

  describe('createWebhook', () => {
    it('should create webhook successfully', async () => {
      const mockResponse = {
        id: 'webhook123',
        type: 'transaction',
        url: 'https://example.com/webhook',
        label: 'Test Webhook'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('transaction')
        .mockReturnValueOnce('https://example.com/webhook')
        .mockReturnValueOnce('Test Webhook');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          type: 'transaction',
          url: 'https://example.com/webhook',
          label: 'Test Webhook',
        },
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getWebhook', () => {
    it('should get webhook details successfully', async () => {
      const mockResponse = {
        id: 'webhook123',
        type: 'transaction',
        url: 'https://example.com/webhook'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('webhook123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook successfully', async () => {
      const mockResponse = {
        id: 'webhook123',
        type: 'transfer',
        url: 'https://updated.example.com/webhook',
        label: 'Updated Webhook'
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('webhook123')
        .mockReturnValueOnce('transfer')
        .mockReturnValueOnce('https://updated.example.com/webhook')
        .mockReturnValueOnce('Updated Webhook');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          type: 'transfer',
          url: 'https://updated.example.com/webhook',
          label: 'Updated Webhook',
        },
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('removeWebhook', () => {
    it('should remove webhook successfully', async () => {
      const mockResponse = { removed: true };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('removeWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('webhook123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('simulateWebhook', () => {
    it('should simulate webhook successfully', async () => {
      const mockResponse = { simulated: true };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('simulateWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('webhook123')
        .mockReturnValueOnce('txhash123')
        .mockReturnValueOnce('sim-webhook123');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123/simulate',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
        body: {
          txHash: 'txhash123',
          webhookId: 'sim-webhook123',
        },
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        response: {
          body: {
            error: 'Invalid webhook URL'
          }
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createWebhook')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      await expect(executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      const mockError = new Error('Network error');

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listWebhooks')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123');

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

      const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'Network error' }, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Enterprise Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  it('should list enterprises successfully', async () => {
    const mockResponse = {
      enterprises: [
        { id: '123', name: 'Test Enterprise' }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'listEnterprises';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/enterprise',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should get enterprise details successfully', async () => {
    const mockResponse = {
      id: '123',
      name: 'Test Enterprise',
      users: []
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getEnterprise';
      if (paramName === 'enterpriseId') return '123';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://app.bitgo.com/api/v2/enterprise/123',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should update enterprise successfully', async () => {
    const mockResponse = {
      id: '123',
      name: 'Updated Enterprise',
      emergencyPhone: '+1234567890'
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'updateEnterprise';
      if (paramName === 'enterpriseId') return '123';
      if (paramName === 'name') return 'Updated Enterprise';
      if (paramName === 'emergencyPhone') return '+1234567890';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'https://app.bitgo.com/api/v2/enterprise/123',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      body: {
        name: 'Updated Enterprise',
        emergencyPhone: '+1234567890',
      },
      json: true,
    });
  });

  it('should get enterprise users successfully', async () => {
    const mockResponse = {
      users: [
        { id: 'user1', username: 'testuser', permission: 'admin' }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getEnterpriseUsers';
      if (paramName === 'enterpriseId') return '123';
      if (paramName === 'allowInactiveAdmins') return true;
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should add enterprise user successfully', async () => {
    const mockResponse = {
      success: true,
      user: { username: 'newuser', permission: 'view' }
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'addEnterpriseUser';
      if (paramName === 'enterpriseId') return '123';
      if (paramName === 'username') return 'newuser';
      if (paramName === 'usernames') return '';
      if (paramName === 'permission') return 'view';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should remove enterprise user successfully', async () => {
    const mockResponse = {
      success: true
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'removeEnterpriseUser';
      if (paramName === 'enterpriseId') return '123';
      if (paramName === 'userId') return 'user456';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'DELETE',
      url: 'https://app.bitgo.com/api/v2/enterprise/123/users/user456',
      headers: {
        'Authorization': 'Bearer test-api-key',
        'Content-Type': 'application/json',
      },
      json: true,
    });
  });

  it('should get enterprise wallets successfully', async () => {
    const mockResponse = {
      wallets: [
        { id: 'wallet1', coin: 'btc', balance: 1000000 }
      ]
    };

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getEnterpriseWallets';
      if (paramName === 'enterpriseId') return '123';
      if (paramName === 'coin') return 'btc';
      if (paramName === 'limit') return 10;
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
  });

  it('should handle API errors gracefully', async () => {
    const apiError = new Error('API Error: Invalid enterprise ID');

    mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
      if (paramName === 'operation') return 'getEnterprise';
      if (paramName === 'enterpriseId') return 'invalid';
      return null;
    });
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const items = [{ json: {} }];
    const result = await executeEnterpriseOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error: Invalid enterprise ID');
  });
});

describe('Policy Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2',
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn(),
      },
    };
  });

  describe('getWalletPolicy', () => {
    it('should get wallet policy successfully', async () => {
      const mockPolicy = { rules: [], status: 'enabled' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getWalletPolicy';
          case 'coin': return 'btc';
          case 'walletId': return 'test-wallet-id';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPolicy);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockPolicy);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://app.bitgo.com/api/v2/btc/wallet/test-wallet-id/policy',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('updateWalletPolicy', () => {
    it('should update wallet policy successfully', async () => {
      const mockResponse = { success: true };
      const mockRules = [{ id: 'rule1', type: 'velocity' }];
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'updateWalletPolicy';
          case 'coin': return 'btc';
          case 'walletId': return 'test-wallet-id';
          case 'rules': return mockRules;
          case 'action': return 'deny';
          case 'condition': return { amount: { $gt: 1000 } };
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('addPolicyRule', () => {
    it('should add policy rule successfully', async () => {
      const mockResponse = { id: 'new-rule-id', status: 'active' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'addPolicyRule';
          case 'coin': return 'btc';
          case 'walletId': return 'test-wallet-id';
          case 'id': return 'new-rule-id';
          case 'type': return 'velocity';
          case 'action': return 'deny';
          case 'condition': return { amount: { $gt: 1000 } };
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('removePolicyRule', () => {
    it('should remove policy rule successfully', async () => {
      const mockResponse = { success: true };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'removePolicyRule';
          case 'coin': return 'btc';
          case 'walletId': return 'test-wallet-id';
          case 'ruleId': return 'rule-to-remove';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getEnterprisePolicy', () => {
    it('should get enterprise policy successfully', async () => {
      const mockPolicy = { rules: [], enterpriseId: 'test-enterprise' };
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getEnterprisePolicy';
          case 'enterpriseId': return 'test-enterprise';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockPolicy);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockPolicy);
    });
  });

  describe('updateEnterprisePolicy', () => {
    it('should update enterprise policy successfully', async () => {
      const mockResponse = { success: true };
      const mockRules = [{ id: 'enterprise-rule1', type: 'whitelist' }];
      
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'updateEnterprisePolicy';
          case 'enterpriseId': return 'test-enterprise';
          case 'rules': return mockRules;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getWalletPolicy';
          case 'coin': return 'btc';
          case 'walletId': return 'invalid-wallet';
          default: return undefined;
        }
      });

      const apiError = new Error('Wallet not found');
      (apiError as any).httpCode = 404;
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

      await expect(
        executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Wallet not found');
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getWalletPolicy';
          case 'coin': return 'btc';
          case 'walletId': return 'invalid-wallet';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const result = await executePolicyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'API Error' });
    });
  });
});
});
