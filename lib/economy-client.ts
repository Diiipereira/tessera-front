import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import {
	KINDS_OF,
	type LedgerDto,
	type ShopItemDto,
	type ShopItemPayload
} from '@/lib/modules/economy';
import type { TransactionKind } from '@/lib/types/module-configs';

export type ShopResult =
	{ status: 'ok'; items: ShopItemDto[] } | { status: 'error'; failure: ApiFailure };

export type LedgerResult =
	{ status: 'ok'; page: LedgerDto } | { status: 'error'; failure: ApiFailure };

export type ClearResult =
	{ status: 'ok'; cleared: number } | { status: 'error'; failure: ApiFailure };

const economyUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/economy`;

export const ledgerQuery = (kind: TransactionKind | 'all', limit: number): string => {
	const params = new URLSearchParams({ limit: String(limit) });

	if (kind !== 'all') {
		for (const type of KINDS_OF[kind]) {
			params.append('type', type);
		}
	}

	return params.toString();
};

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

async function call(url: string, init?: RequestInit): Promise<Response | ApiFailure> {
	try {
		return await fetch(url, { credentials: 'include', ...init });
	} catch (error) {
		return unreachable(error);
	}
}

export async function loadShop(guildId: string): Promise<ShopResult> {
	const response = await call(`${economyUrl(guildId)}/shop`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { items: ShopItemDto[] };

	return { status: 'ok', items: body.items };
}

export async function saveShop(
	guildId: string,
	items: readonly ShopItemPayload[]
): Promise<ShopResult> {
	const response = await call(`${economyUrl(guildId)}/shop`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ items })
	});

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { items: ShopItemDto[] };

	return { status: 'ok', items: body.items };
}

export async function loadTransactions(
	guildId: string,
	kind: TransactionKind | 'all',
	limit = 25
): Promise<LedgerResult> {
	const response = await call(`${economyUrl(guildId)}/transactions?${ledgerQuery(kind, limit)}`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', page: (await response.json()) as LedgerDto };
}

export async function clearWallets(guildId: string): Promise<ClearResult> {
	const response = await call(`${economyUrl(guildId)}/wallets`, { method: 'DELETE' });

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { cleared: number };

	return { status: 'ok', cleared: body.cleared };
}
