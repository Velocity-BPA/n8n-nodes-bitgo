/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { BitGo } from '../../nodes/BitGo/BitGo.node';
import { BitGoTrigger } from '../../nodes/BitGo/BitGoTrigger.node';

describe('BitGo Node', () => {
	let bitgoNode: BitGo;

	beforeEach(() => {
		bitgoNode = new BitGo();
	});

	describe('Node Description', () => {
		it('should have correct displayName', () => {
			expect(bitgoNode.description.displayName).toBe('BitGo');
		});

		it('should have correct name', () => {
			expect(bitgoNode.description.name).toBe('bitGo');
		});

		it('should have correct icon', () => {
			expect(bitgoNode.description.icon).toBe('file:bitgo.svg');
		});

		it('should have version 1', () => {
			expect(bitgoNode.description.version).toBe(1);
		});

		it('should have correct group', () => {
			expect(bitgoNode.description.group).toContain('transform');
		});

		it('should require bitGoApi credentials', () => {
			const credentials = bitgoNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials?.length).toBeGreaterThan(0);
			expect(credentials?.[0].name).toBe('bitGoApi');
			expect(credentials?.[0].required).toBe(true);
		});
	});

	describe('Resources', () => {
		it('should have wallet resource', () => {
			const resourceProperty = bitgoNode.description.properties.find(
				(p) => p.name === 'resource',
			);
			expect(resourceProperty).toBeDefined();
			const options = resourceProperty?.options as Array<{ value: string }>;
			expect(options?.some((o) => o.value === 'wallet')).toBe(true);
		});

		it('should have address resource', () => {
			const resourceProperty = bitgoNode.description.properties.find(
				(p) => p.name === 'resource',
			);
			const options = resourceProperty?.options as Array<{ value: string }>;
			expect(options?.some((o) => o.value === 'address')).toBe(true);
		});

		it('should have transaction resource', () => {
			const resourceProperty = bitgoNode.description.properties.find(
				(p) => p.name === 'resource',
			);
			const options = resourceProperty?.options as Array<{ value: string }>;
			expect(options?.some((o) => o.value === 'transaction')).toBe(true);
		});

		it('should have 12 resources', () => {
			const resourceProperty = bitgoNode.description.properties.find(
				(p) => p.name === 'resource',
			);
			const options = resourceProperty?.options as Array<{ value: string; disabled?: boolean }>;
			// Filter out any disabled dividers
			const actualResources = options?.filter((o) => !o.disabled);
			expect(actualResources?.length).toBe(12);
		});
	});

	describe('Coin Selection', () => {
		it('should have coin property', () => {
			const coinProperty = bitgoNode.description.properties.find((p) => p.name === 'coin');
			expect(coinProperty).toBeDefined();
		});

		it('should have mainnet and testnet coins', () => {
			const coinProperty = bitgoNode.description.properties.find((p) => p.name === 'coin');
			const options = coinProperty?.options as Array<{ value: string }>;
			expect(options?.some((o) => o.value === 'btc')).toBe(true);
			expect(options?.some((o) => o.value === 'tbtc')).toBe(true);
		});
	});
});

describe('BitGo Trigger Node', () => {
	let triggerNode: BitGoTrigger;

	beforeEach(() => {
		triggerNode = new BitGoTrigger();
	});

	describe('Node Description', () => {
		it('should have correct displayName', () => {
			expect(triggerNode.description.displayName).toBe('BitGo Trigger');
		});

		it('should have correct name', () => {
			expect(triggerNode.description.name).toBe('bitGoTrigger');
		});

		it('should be in trigger group', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have no inputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
		});

		it('should have one output', () => {
			expect(triggerNode.description.outputs.length).toBe(1);
		});
	});

	describe('Webhook Configuration', () => {
		it('should have webhook configuration', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks?.length).toBeGreaterThan(0);
		});

		it('should use POST method', () => {
			const webhook = triggerNode.description.webhooks?.[0];
			expect(webhook?.httpMethod).toBe('POST');
		});
	});

	describe('Event Types', () => {
		it('should have event property', () => {
			const eventProperty = triggerNode.description.properties.find((p) => p.name === 'event');
			expect(eventProperty).toBeDefined();
		});

		it('should have transfer event type', () => {
			const eventProperty = triggerNode.description.properties.find((p) => p.name === 'event');
			const options = eventProperty?.options as Array<{ value: string }>;
			expect(options?.some((o) => o.value === 'transfer')).toBe(true);
		});
	});

	describe('Webhook Methods', () => {
		it('should have webhookMethods defined', () => {
			expect(triggerNode.webhookMethods).toBeDefined();
		});

		it('should have default webhook method', () => {
			expect(triggerNode.webhookMethods.default).toBeDefined();
		});

		it('should have checkExists method', () => {
			expect(triggerNode.webhookMethods.default.checkExists).toBeDefined();
		});

		it('should have create method', () => {
			expect(triggerNode.webhookMethods.default.create).toBeDefined();
		});

		it('should have delete method', () => {
			expect(triggerNode.webhookMethods.default.delete).toBeDefined();
		});
	});
});
