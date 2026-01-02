/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	BITGO_ENVIRONMENTS,
	SUPPORTED_COINS,
	TESTNET_COINS,
	WEBHOOK_TYPES,
	PENDING_APPROVAL_STATES,
} from '../../nodes/BitGo/constants';

describe('BitGo Constants', () => {
	describe('BITGO_ENVIRONMENTS', () => {
		it('should have production and test environments', () => {
			expect(BITGO_ENVIRONMENTS).toHaveProperty('production');
			expect(BITGO_ENVIRONMENTS).toHaveProperty('test');
		});

		it('should have correct production URL', () => {
			expect(BITGO_ENVIRONMENTS.production).toBe('https://app.bitgo.com/api/v2');
		});

		it('should have correct test URL', () => {
			expect(BITGO_ENVIRONMENTS.test).toBe('https://app.bitgo-test.com/api/v2');
		});
	});

	describe('SUPPORTED_COINS', () => {
		it('should include major cryptocurrencies', () => {
			expect(SUPPORTED_COINS).toContain('btc');
			expect(SUPPORTED_COINS).toContain('eth');
			expect(SUPPORTED_COINS).toContain('ltc');
			expect(SUPPORTED_COINS).toContain('xrp');
			expect(SUPPORTED_COINS).toContain('sol');
		});

		it('should have at least 15 supported coins', () => {
			expect(SUPPORTED_COINS.length).toBeGreaterThanOrEqual(15);
		});

		it('should not contain testnet coins', () => {
			expect(SUPPORTED_COINS).not.toContain('tbtc');
			expect(SUPPORTED_COINS).not.toContain('teth');
		});
	});

	describe('TESTNET_COINS', () => {
		it('should include testnet versions of major coins', () => {
			expect(TESTNET_COINS).toContain('tbtc');
			expect(TESTNET_COINS).toContain('teth');
			expect(TESTNET_COINS).toContain('tltc');
		});

		it('should have testnet coins starting with t', () => {
			TESTNET_COINS.forEach((coin) => {
				expect(coin.startsWith('t')).toBe(true);
			});
		});
	});

	describe('WEBHOOK_TYPES', () => {
		it('should include transfer webhook type', () => {
			expect(WEBHOOK_TYPES).toContain('transfer');
		});

		it('should include transaction webhook type', () => {
			expect(WEBHOOK_TYPES).toContain('transaction');
		});

		it('should include pendingapproval webhook type', () => {
			expect(WEBHOOK_TYPES).toContain('pendingapproval');
		});

		it('should include block webhook type', () => {
			expect(WEBHOOK_TYPES).toContain('block');
		});

		it('should have at least 5 webhook types', () => {
			expect(WEBHOOK_TYPES.length).toBeGreaterThanOrEqual(5);
		});
	});

	describe('PENDING_APPROVAL_STATES', () => {
		it('should include pending state', () => {
			expect(PENDING_APPROVAL_STATES).toContain('pending');
		});

		it('should include approved state', () => {
			expect(PENDING_APPROVAL_STATES).toContain('approved');
		});

		it('should include rejected state', () => {
			expect(PENDING_APPROVAL_STATES).toContain('rejected');
		});

		it('should include canceled state', () => {
			expect(PENDING_APPROVAL_STATES).toContain('canceled');
		});

		it('should have exactly 4 states', () => {
			expect(PENDING_APPROVAL_STATES.length).toBe(4);
		});
	});
});
