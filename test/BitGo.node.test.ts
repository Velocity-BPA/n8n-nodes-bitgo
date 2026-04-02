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
        accessToken: 'test-token',
        baseUrl: 'https://app.bitgo.com/api/v2'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test BitGo Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  it('should create a wallet successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('createWallet')
      .mockReturnValueOnce('btc')
      .mockReturnValueOnce('Test Wallet')
      .mockReturnValueOnce('test-passphrase')
      .mockReturnValueOnce('user-key')
      .mockReturnValueOnce('backup-key');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'wallet123',
      label: 'Test Wallet'
    });

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('wallet123');
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'POST',
      url: 'https://app.bitgo.com/api/v2/btc/wallet',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: {
        label: 'Test Wallet',
        passphrase: 'test-passphrase',
        userKey: 'user-key',
        backupKey: 'backup-key'
      },
      json: true,
    });
  });

  it('should get wallet details successfully', async () => {
    mockExecuteFunctions.getNodeParameter
      .mockReturnValueOnce('getWallet')
      .mockReturnValueOnce('btc')
      .mockReturnValueOnce('wallet123');

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
      id: 'wallet123',
      label: 'Test Wallet',
      balance: 1000000
    });

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.id).toBe('wallet123');
  });

  it('should handle errors when continueOnFail is true', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getWallet');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

    const items = [{ json: {} }];
    const result = await executeWalletOperations.call(mockExecuteFunctions, items);

    expect(result).toHaveLength(1);
    expect(result[0].json.error).toBe('API Error');
  });
});

describe('Address Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
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

	describe('createAddress', () => {
		it('should create address successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createAddress')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('Test Address');

			const mockResponse = {
				address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
				chain: 0,
				label: 'Test Address',
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAddressOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle create address error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createAddress')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(0)
				.mockReturnValueOnce('Test Address');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('API Error'),
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAddressOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: { error: 'API Error' },
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('getAddress', () => {
		it('should get address successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAddress')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2');

			const mockResponse = {
				address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
				balance: 1000000,
				label: 'Test Address',
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAddressOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('listAddresses', () => {
		it('should list addresses successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listAddresses')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(25)
				.mockReturnValueOnce(0);

			const mockResponse = {
				addresses: [
					{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', balance: 1000000 },
				],
				count: 1,
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAddressOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('updateAddress', () => {
		it('should update address successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateAddress')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
				.mockReturnValueOnce('Updated Label');

			const mockResponse = {
				address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
				label: 'Updated Label',
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAddressOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('Transaction Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
				baseUrl: 'https://app.bitgo.com/api/v2',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('createTransaction', () => {
		it('should create transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce(100000)
				.mockReturnValueOnce('passphrase123');

			const mockResponse = { txid: 'abc123', status: 'signed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle createTransaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('invalid-address')
				.mockReturnValueOnce(100000)
				.mockReturnValueOnce('passphrase123');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Invalid address'));

			const items = [{ json: {} }];
			await expect(executeTransactionOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Invalid address');
		});
	});

	describe('getTransaction', () => {
		it('should get transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('txid123');

			const mockResponse = { id: 'txid123', confirmations: 6 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle getTransaction error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('invalid-txid');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Transaction not found'));

			const items = [{ json: {} }];
			await expect(executeTransactionOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Transaction not found');
		});
	});

	describe('listTransactions', () => {
		it('should list transactions successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listTransactions')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce(10)
				.mockReturnValueOnce(0);

			const mockResponse = { transactions: [{ id: 'tx1' }, { id: 'tx2' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});

	describe('buildTransaction', () => {
		it('should build transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('buildTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('[{"address":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa","amount":100000}]')
				.mockReturnValueOnce(10);

			const mockResponse = { txHex: '0100000001...', fee: 1000 };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});

		it('should handle invalid recipients JSON', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('buildTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('invalid-json')
				.mockReturnValueOnce(10);

			const items = [{ json: {} }];
			await expect(executeTransactionOperations.call(mockExecuteFunctions, items)).rejects.toThrow('Recipients must be valid JSON');
		});
	});

	describe('signTransaction', () => {
		it('should sign transaction successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('signTransaction')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('0100000001...')
				.mockReturnValueOnce('passphrase123');

			const mockResponse = { txHex: '0100000001...', status: 'signed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const items = [{ json: {} }];
			const result = await executeTransactionOperations.call(mockExecuteFunctions, items);

			expect(result).toEqual([
				{
					json: mockResponse,
					pairedItem: { item: 0 },
				},
			]);
		});
	});
});

describe('Transfer Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				accessToken: 'test-token',
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

	describe('createTransfer', () => {
		it('should create transfer successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createTransfer')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce(100000)
				.mockReturnValueOnce('test-passphrase')
				.mockReturnValueOnce({});

			const mockResponse = { id: 'transfer123', state: 'pending' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/transfer',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				body: {
					address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
					amount: '100000',
					walletPassphrase: 'test-passphrase',
				},
				json: true,
			});
		});

		it('should handle createTransfer error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createTransfer')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')
				.mockReturnValueOnce(100000)
				.mockReturnValueOnce('test-passphrase')
				.mockReturnValueOnce({});

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getTransfer', () => {
		it('should get transfer successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getTransfer')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('transfer123');

			const mockResponse = { id: 'transfer123', state: 'confirmed' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/transfer/transfer123',
				headers: {
					'Authorization': 'Bearer test-token',
				},
				json: true,
			});
		});
	});

	describe('listTransfers', () => {
		it('should list transfers successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listTransfers')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('pending')
				.mockReturnValueOnce(10);

			const mockResponse = { transfers: [{ id: 'transfer1' }, { id: 'transfer2' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/transfer',
				headers: {
					'Authorization': 'Bearer test-token',
				},
				qs: {
					limit: '10',
					state: 'pending',
				},
				json: true,
			});
		});
	});

	describe('updateTransfer', () => {
		it('should update transfer successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updateTransfer')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('transfer123')
				.mockReturnValueOnce('accepted');

			const mockResponse = { id: 'transfer123', state: 'accepted' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/transfer/transfer123',
				headers: {
					'Authorization': 'Bearer test-token',
					'Content-Type': 'application/json',
				},
				body: {
					state: 'accepted',
				},
				json: true,
			});
		});
	});

	describe('cancelTransfer', () => {
		it('should cancel transfer successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('cancelTransfer')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('transfer123');

			const mockResponse = { success: true };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeTransferOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/transfer/transfer123',
				headers: {
					'Authorization': 'Bearer test-token',
				},
				json: true,
			});
		});
	});
});

describe('Key Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ 
        apiKey: 'test-api-key',
        baseUrl: 'https://app.bitgo.com/api/v2'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'BitGo Key Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
      },
    };
  });

  describe('createKeychain operation', () => {
    it('should successfully create a keychain', async () => {
      const mockResponse = { id: 'keychain123', pub: 'public-key', encryptedPrv: 'encrypted-private' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('createKeychain')
        .mockReturnValueOnce('user')
        .mockReturnValueOnce('optional-entropy');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://app.bitgo.com/api/v2/keychain',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: { source: 'user', entropy: 'optional-entropy' },
        json: true,
      });
    });

    it('should handle createKeychain errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('createKeychain');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getKeychain operation', () => {
    it('should successfully get keychain details', async () => {
      const mockResponse = { id: 'keychain123', pub: 'test-public-key', source: 'user' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getKeychain')
        .mockReturnValueOnce('test-public-key');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('updateKeychain operation', () => {
    it('should successfully update keychain', async () => {
      const mockResponse = { success: true };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('updateKeychain')
        .mockReturnValueOnce('test-public-key')
        .mockReturnValueOnce('encrypted-private-key');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('consolidateUnspents operation', () => {
    it('should successfully consolidate unspents', async () => {
      const mockResponse = { txid: 'transaction123', status: 'pending' };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('consolidateUnspents')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce('wallet-passphrase');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('listUnspents operation', () => {
    it('should successfully list unspents', async () => {
      const mockResponse = { unspents: [{ txid: 'tx1', value: 50000 }], total: 1 };
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('listUnspents')
        .mockReturnValueOnce('btc')
        .mockReturnValueOnce('wallet123')
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(1000);
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeKeyOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Webhook Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				apiKey: 'test-key',
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

	describe('createWebhook', () => {
		it('should create a webhook successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createWebhook')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('https://example.com/webhook')
				.mockReturnValueOnce('transaction');

			const mockResponse = { id: 'webhook123', url: 'https://example.com/webhook', type: 'transaction' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
				body: {
					url: 'https://example.com/webhook',
					type: 'transaction',
				},
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});

		it('should handle create webhook error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createWebhook')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('https://example.com/webhook')
				.mockReturnValueOnce('transaction');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Create failed'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Create failed' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('listWebhooks', () => {
		it('should list webhooks successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('listWebhooks')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123');

			const mockResponse = { webhooks: [{ id: 'webhook1' }, { id: 'webhook2' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks',
				headers: {
					'Authorization': 'Bearer test-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('deleteWebhook', () => {
		it('should delete a webhook successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteWebhook')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('webhook123');

			const mockResponse = { removed: 'webhook123' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123',
				headers: {
					'Authorization': 'Bearer test-key',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});

	describe('simulateWebhook', () => {
		it('should simulate a webhook successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('simulateWebhook')
				.mockReturnValueOnce('btc')
				.mockReturnValueOnce('wallet123')
				.mockReturnValueOnce('webhook123');

			const mockResponse = { sent: true, webhookId: 'webhook123' };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWebhookOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://app.bitgo.com/api/v2/btc/wallet/wallet123/webhooks/webhook123/simulate',
				headers: {
					'Authorization': 'Bearer test-key',
					'Content-Type': 'application/json',
				},
				json: true,
				body: {},
			});
			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		});
	});
});
});
