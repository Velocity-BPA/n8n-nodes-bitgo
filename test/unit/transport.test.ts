/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	getBaseUrl,
	formatAmount,
	parseAmount,
	buildRecipients,
} from '../../nodes/BitGo/transport/requestWithAuth';

describe('BitGo Transport Functions', () => {
	describe('getBaseUrl', () => {
		it('should return production URL for production environment', () => {
			const url = getBaseUrl('production');
			expect(url).toBe('https://app.bitgo.com/api/v2');
		});

		it('should return test URL for test environment', () => {
			const url = getBaseUrl('test');
			expect(url).toBe('https://app.bitgo-test.com/api/v2');
		});
	});

	describe('formatAmount', () => {
		it('should return string as-is', () => {
			expect(formatAmount('1000000')).toBe('1000000');
		});

		it('should convert number to string', () => {
			expect(formatAmount(1000000)).toBe('1000000');
		});

		it('should handle zero', () => {
			expect(formatAmount(0)).toBe('0');
			expect(formatAmount('0')).toBe('0');
		});

		it('should handle large numbers', () => {
			expect(formatAmount('100000000000000')).toBe('100000000000000');
		});
	});

	describe('parseAmount', () => {
		it('should parse string to number', () => {
			expect(parseAmount('1000000')).toBe(1000000);
		});

		it('should handle zero', () => {
			expect(parseAmount('0')).toBe(0);
		});

		it('should handle large amounts', () => {
			expect(parseAmount('100000000000')).toBe(100000000000);
		});
	});

	describe('buildRecipients', () => {
		it('should build recipients array with string amounts', () => {
			const input = [
				{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', amount: '1000000' },
				{ address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', amount: '2000000' },
			];
			const result = buildRecipients(input);
			expect(result).toEqual([
				{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', amount: '1000000' },
				{ address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', amount: '2000000' },
			]);
		});

		it('should convert number amounts to strings', () => {
			const input = [
				{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', amount: 1000000 },
			];
			const result = buildRecipients(input);
			expect(result).toEqual([
				{ address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', amount: '1000000' },
			]);
		});

		it('should handle empty array', () => {
			expect(buildRecipients([])).toEqual([]);
		});
	});
});
