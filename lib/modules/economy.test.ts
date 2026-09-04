import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ledgerQuery } from '@/lib/economy-client';
import type { EconomyConfig, ShopItem } from '@/lib/types/module-configs';
import {
	DEFAULT_CURRENCY_SYMBOL,
	KINDS_OF,
	MAX_SHOP_ITEMS,
	colourFor,
	isSavedId,
	kindOf,
	nameless,
	toEconomyConfig,
	toEconomyPatch,
	toShopPayload,
	toTransactions,
	type LedgerEntryDto,
	type ShopItemDto
} from './economy';

const ITEM_UUID = 'e6b3e0a2-1111-4222-8333-444444444444';
const ROLE_ID = '801234567890123001';
const ALICE = '111111111111111111';

const state = (config: Record<string, unknown> = {}, enabled = true): GuildModuleStateDto => ({
	key: 'economy',
	configured: true,
	enabled,
	config,
	version: 4
});

const dto = (patch: Partial<ShopItemDto> = {}): ShopItemDto => ({
	id: ITEM_UUID,
	name: 'Booster colour',
	description: 'A custom name colour',
	price: 250,
	roleId: ROLE_ID,
	stock: null,
	maxPerUser: null,
	enabled: true,
	...patch
});

const item = (patch: Partial<ShopItem> = {}): ShopItem => ({
	id: ITEM_UUID,
	name: 'Booster colour',
	description: 'A custom name colour',
	price: 250,
	roleId: ROLE_ID,
	stock: null,
	perUserLimit: null,
	...patch
});

const entry = (patch: Partial<LedgerEntryDto> = {}): LedgerEntryDto => ({
	id: 10,
	userId: ALICE,
	counterpartyId: null,
	username: 'alice',
	globalName: 'Alice',
	avatarHash: null,
	amount: 250,
	balanceAfter: 250,
	type: 'daily',
	reason: null,
	createdAt: '2026-09-04T12:00:00.000Z',
	...patch
});

const draft = (patch: Partial<EconomyConfig> = {}): EconomyConfig => ({
	...toEconomyConfig(state(), []),
	...patch
});

describe('isSavedId', () => {
	it('knows an item the API already gave an id to', () => {
		expect(isSavedId(ITEM_UUID)).toBe(true);
	});

	it('knows an item that only exists in this browser tab', () => {
		expect(isSavedId('item_abc123')).toBe(false);
	});
});

describe('toEconomyConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toEconomyConfig(state({}, false), []).enabled).toBe(false);
	});

	it('reads a currency nobody named as an empty box', () => {
		expect(toEconomyConfig(state(), []).currencyName).toBe('');
	});

	it('falls back to the coin when no symbol was chosen', () => {
		expect(toEconomyConfig(state(), []).currencySymbol).toBe(DEFAULT_CURRENCY_SYMBOL);
	});

	it('keeps the numbers the guild wrote', () => {
		expect(toEconomyConfig(state({ dailyAmount: 500 }), []).dailyAmount).toBe(500);
	});

	it('clamps a number the API would refuse anyway', () => {
		expect(toEconomyConfig(state({ transferTaxPercent: 900 }), []).transferTaxPercent).toBe(100);
	});

	it('reads a number that is not a number as the default', () => {
		expect(toEconomyConfig(state({ dailyAmount: 'lots' }), []).dailyAmount).toBe(250);
	});

	it('renames the per member limit to what the screen calls it', () => {
		expect(toEconomyConfig(state(), [dto({ maxPerUser: 2 })]).shop[0]?.perUserLimit).toBe(2);
	});

	it('keeps the id the API gave, so the next save edits instead of duplicating', () => {
		expect(toEconomyConfig(state(), [dto()]).shop[0]?.id).toBe(ITEM_UUID);
	});
});

describe('toEconomyPatch', () => {
	it('sends a currency nobody named as absent, not as an empty string', () => {
		expect(toEconomyPatch(draft({ currencyName: '   ' })).currencyName).toBeNull();
	});

	it('trims the currency name it sends', () => {
		expect(toEconomyPatch(draft({ currencyName: '  Shards  ' })).currencyName).toBe('Shards');
	});

	it('never sends an empty symbol, which would leave amounts bare', () => {
		expect(toEconomyPatch(draft({ currencySymbol: '' })).currencySymbol).toBe(
			DEFAULT_CURRENCY_SYMBOL
		);
	});

	it('never sends the shop, which has a route of its own', () => {
		expect(toEconomyPatch(draft())).not.toHaveProperty('shop');
	});

	it('sends every number the screen holds', () => {
		expect(toEconomyPatch(draft({ streakBonus: 25 })).streakBonus).toBe(25);
	});
});

describe('toShopPayload', () => {
	it('sends the item the screen holds', () => {
		expect(toShopPayload([item()])[0]).toMatchObject({
			id: ITEM_UUID,
			name: 'Booster colour',
			price: 250,
			roleId: ROLE_ID
		});
	});

	it('sends no id for an item this browser just invented', () => {
		expect(toShopPayload([item({ id: 'item_new' })])[0]?.id).toBeNull();
	});

	it('leaves out an item that never got a name, since the API would refuse it', () => {
		expect(toShopPayload([item(), item({ id: 'item_2', name: '  ' })])).toHaveLength(1);
	});

	it('renames the per member limit to what the API calls it', () => {
		expect(toShopPayload([item({ perUserLimit: 3 })])[0]?.maxPerUser).toBe(3);
	});

	it('never sends a per member limit of zero, which the API would refuse', () => {
		expect(toShopPayload([item({ perUserLimit: 0 })])[0]?.maxPerUser).toBe(1);
	});

	it('keeps an unlimited stock unlimited', () => {
		expect(toShopPayload([item({ stock: null })])[0]?.stock).toBeNull();
	});

	it('never sends a negative price', () => {
		expect(toShopPayload([item({ price: -50 })])[0]?.price).toBe(0);
	});

	it('trims the name it sends', () => {
		expect(toShopPayload([item({ name: '  Booster  ' })])[0]?.name).toBe('Booster');
	});

	it('never sends more items than the API would take', () => {
		const many = Array.from({ length: MAX_SHOP_ITEMS + 5 }, (_, index) =>
			item({ id: `item_${String(index)}`, name: `Item ${String(index)}` })
		);

		expect(toShopPayload(many)).toHaveLength(MAX_SHOP_ITEMS);
	});
});

describe('what the screen warns about', () => {
	it('counts the items that would be dropped on save', () => {
		expect(nameless([item(), item({ id: 'item_2', name: '' })])).toBe(1);
	});

	it('has nothing to warn about when every item has a name', () => {
		expect(nameless([item()])).toBe(0);
	});
});

describe('kindOf', () => {
	it('folds the two admin moves into one chip', () => {
		expect([kindOf('admin_grant'), kindOf('admin_take')]).toEqual(['admin', 'admin']);
	});

	it('calls a shop purchase a purchase', () => {
		expect(kindOf('shop_purchase')).toBe('purchase');
	});

	it('leaves the plain kinds alone', () => {
		expect([kindOf('daily'), kindOf('work'), kindOf('transfer')]).toEqual([
			'daily',
			'work',
			'transfer'
		]);
	});

	it('covers every kind the API can send', () => {
		const covered = Object.values(KINDS_OF).flat();

		expect(covered).toHaveLength(new Set(covered).size);
	});
});

describe('ledgerQuery', () => {
	it('asks for no kind at all when the filter is off', () => {
		expect(ledgerQuery('all', 25)).toBe('limit=25');
	});

	it('asks the server for the one kind behind a chip', () => {
		expect(ledgerQuery('purchase', 25)).toBe('limit=25&type=shop_purchase');
	});

	it('asks the server for every kind behind a chip that groups several', () => {
		expect(ledgerQuery('admin', 10)).toContain('type=admin_grant&type=admin_take');
	});
});

describe('toTransactions', () => {
	it('prefers the name the member goes by', () => {
		expect(toTransactions({ entries: [entry()], nextCursor: null })[0]?.actorName).toBe('Alice');
	});

	it('falls back to the username, then to the id', () => {
		const rows = toTransactions({
			entries: [
				entry({ globalName: null }),
				entry({ id: 9, userId: '222222222222222222', globalName: null, username: null })
			],
			nextCursor: null
		});

		expect(rows.map((row) => row.actorName)).toEqual(['alice', '222222222222222222']);
	});

	it('keeps the sign of the amount, which the screen colours by', () => {
		expect(
			toTransactions({ entries: [entry({ amount: -250 })], nextCursor: null })[0]?.amount
		).toBe(-250);
	});

	it('hands the moment over untouched, so the screen can say it in the reader language', () => {
		expect(toTransactions({ entries: [entry()], nextCursor: null })[0]?.at).toBe(
			'2026-09-04T12:00:00.000Z'
		);
	});

	it('reads a purchase reason as the note', () => {
		expect(
			toTransactions({
				entries: [entry({ type: 'shop_purchase', reason: 'Booster colour' })],
				nextCursor: null
			})[0]?.note
		).toBe('Booster colour');
	});

	it('gives an empty note rather than the word null', () => {
		expect(toTransactions({ entries: [entry()], nextCursor: null })[0]?.note).toBe('');
	});

	it('gives the same member the same colour every time', () => {
		expect(colourFor(ALICE)).toBe(colourFor(ALICE));
	});
});
