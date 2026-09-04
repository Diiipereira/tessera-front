import type { GuildModuleStateDto } from '@/lib/api-url';
import type {
	EconomyConfig,
	ShopItem,
	Transaction,
	TransactionKind
} from '@/lib/types/module-configs';

export const MAX_SHOP_ITEMS = 25;

export const MAX_ITEM_NAME_LENGTH = 80;

export const MAX_ITEM_DESCRIPTION_LENGTH = 200;

export const MAX_ITEM_PRICE = 1_000_000_000;

export const MAX_ITEM_STOCK = 1_000_000;

export const MAX_PER_MEMBER = 100;

export const MAX_CURRENCY_NAME_LENGTH = 32;

export const MAX_CURRENCY_SYMBOL_LENGTH = 3;

export const MAX_STARTING_BALANCE = 1_000_000;

export const MAX_CLAIM_AMOUNT = 100_000;

export const MAX_STREAK_BONUS = 10_000;

export const DEFAULT_CURRENCY_SYMBOL = '🪙';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LedgerType =
	| 'daily'
	| 'work'
	| 'transfer'
	| 'shop_purchase'
	| 'admin_grant'
	| 'admin_take'
	| 'gamble'
	| 'reward'
	| 'refund';

export const KINDS_OF: Record<TransactionKind, readonly LedgerType[]> = {
	daily: ['daily'],
	work: ['work'],
	transfer: ['transfer'],
	purchase: ['shop_purchase'],
	admin: ['admin_grant', 'admin_take', 'gamble', 'reward', 'refund']
};

const KIND_BY_TYPE = new Map<LedgerType, TransactionKind>(
	Object.entries(KINDS_OF).flatMap(([kind, types]) =>
		types.map((type) => [type, kind as TransactionKind] as const)
	)
);

export type ShopItemDto = {
	id: string;
	name: string;
	description: string;
	price: number;
	roleId: string | null;
	stock: number | null;
	maxPerUser: number | null;
	enabled: boolean;
};

export type ShopItemPayload = {
	id: string | null;
	name: string;
	description: string;
	price: number;
	roleId: string | null;
	stock: number | null;
	maxPerUser: number | null;
	enabled: boolean;
};

export type LedgerEntryDto = {
	id: number;
	userId: string;
	counterpartyId: string | null;
	username: string | null;
	globalName: string | null;
	avatarHash: string | null;
	amount: number;
	balanceAfter: number;
	type: LedgerType;
	reason: string | null;
	createdAt: string;
};

export type LedgerDto = {
	entries: LedgerEntryDto[];
	nextCursor: number | null;
};

const asString = (value: unknown, fallback: string): string =>
	typeof value === 'string' ? value : fallback;

const asWhole = (value: unknown, fallback: number, low: number, high: number): number =>
	typeof value === 'number' && Number.isFinite(value)
		? Math.min(high, Math.max(low, Math.round(value)))
		: fallback;

export const isSavedId = (id: string): boolean => UUID.test(id);

export const kindOf = (type: LedgerType): TransactionKind => KIND_BY_TYPE.get(type) ?? 'admin';

export function toEconomyConfig(
	state: GuildModuleStateDto,
	items: readonly ShopItemDto[]
): EconomyConfig {
	const { config } = state;

	return {
		enabled: state.enabled,
		currencyName: asString(config.currencyName, '').slice(0, MAX_CURRENCY_NAME_LENGTH),
		currencySymbol: asString(config.currencySymbol, DEFAULT_CURRENCY_SYMBOL).slice(
			0,
			MAX_CURRENCY_SYMBOL_LENGTH
		),
		startingBalance: asWhole(config.startingBalance, 0, 0, MAX_STARTING_BALANCE),
		dailyAmount: asWhole(config.dailyAmount, 250, 0, MAX_CLAIM_AMOUNT),
		dailyCooldownHours: asWhole(config.dailyCooldownHours, 24, 1, 168),
		workAmount: asWhole(config.workAmount, 75, 0, MAX_CLAIM_AMOUNT),
		workCooldownMinutes: asWhole(config.workCooldownMinutes, 30, 1, 1440),
		streakBonus: asWhole(config.streakBonus, 0, 0, MAX_STREAK_BONUS),
		transferTaxPercent: asWhole(config.transferTaxPercent, 0, 0, 100),
		shop: items.map((item) => ({
			id: item.id,
			name: item.name,
			description: item.description,
			price: item.price,
			roleId: item.roleId,
			stock: item.stock,
			perUserLimit: item.maxPerUser
		}))
	};
}

export function toEconomyPatch(config: EconomyConfig): Record<string, unknown> {
	return {
		currencyName: config.currencyName.trim() === '' ? null : config.currencyName.trim(),
		currencySymbol:
			config.currencySymbol.trim() === '' ? DEFAULT_CURRENCY_SYMBOL : config.currencySymbol.trim(),
		startingBalance: config.startingBalance,
		dailyAmount: config.dailyAmount,
		dailyCooldownHours: config.dailyCooldownHours,
		workAmount: config.workAmount,
		workCooldownMinutes: config.workCooldownMinutes,
		streakBonus: config.streakBonus,
		transferTaxPercent: config.transferTaxPercent
	};
}

export const nameless = (items: readonly ShopItem[]): number =>
	items.filter((item) => item.name.trim() === '').length;

export function toShopPayload(items: readonly ShopItem[]): ShopItemPayload[] {
	return items
		.filter((item) => item.name.trim() !== '')
		.slice(0, MAX_SHOP_ITEMS)
		.map((item) => ({
			id: isSavedId(item.id) ? item.id : null,
			name: item.name.trim().slice(0, MAX_ITEM_NAME_LENGTH),
			description: item.description.trim().slice(0, MAX_ITEM_DESCRIPTION_LENGTH),
			price: Math.min(MAX_ITEM_PRICE, Math.max(0, Math.round(item.price))),
			roleId: item.roleId,
			stock: item.stock === null ? null : Math.min(MAX_ITEM_STOCK, Math.max(0, item.stock)),
			maxPerUser:
				item.perUserLimit === null
					? null
					: Math.min(MAX_PER_MEMBER, Math.max(1, item.perUserLimit)),
			enabled: true
		}));
}

const initialsOf = (name: string): string => name.slice(0, 2).toUpperCase();

const COLOURS = ['#5865f2', '#0d9488', '#d97706', '#db2777', '#57f287', '#eb459e'];

export const colourFor = (userId: string): string => {
	const digits = userId.replace(/\D/g, '');
	const tail = Number(digits.slice(-4) || '0');

	return COLOURS[tail % COLOURS.length] ?? COLOURS[0] ?? '#5865f2';
};

export function toTransactions(page: LedgerDto): Transaction[] {
	return page.entries.map((row) => {
		const name = row.globalName ?? row.username ?? row.userId;

		return {
			id: String(row.id),
			kind: kindOf(row.type),
			actorName: name,
			actorInitials: initialsOf(name),
			actorColor: colourFor(row.userId),
			amount: row.amount,
			note: row.reason ?? '',
			at: row.createdAt
		};
	});
}
