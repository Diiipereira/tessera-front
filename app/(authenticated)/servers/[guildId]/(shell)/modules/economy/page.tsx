import { redirect } from 'next/navigation';
import { EconomySkeleton } from '@/components/skeletons/EconomySkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadRoles } from '@/lib/guild-shape';
import {
	toEconomyConfig,
	toTransactions,
	type LedgerDto,
	type ShopItemDto
} from '@/lib/modules/economy';
import type { GuildPageProps } from '@/lib/types/page';
import { EconomyScreen } from './EconomyScreen';

export const metadata = { title: 'Economy' };

const EMPTY_LEDGER: LedgerDto = { entries: [], nextCursor: null };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <EconomySkeleton />;

	const [state, shop, ledger, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/economy`),
		apiGet<{ items: ShopItemDto[] }>(`/guilds/${guildId}/economy/shop`),
		apiGet<LedgerDto>(`/guilds/${guildId}/economy/transactions`),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated' || shop.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (shop.status === 'unreachable')
		throw new ApiUnreachableError(shop.reason, shop.answered, shop.code ?? null);

	return (
		<EconomyScreen
			guildId={guildId}
			config={toEconomyConfig(state.data, shop.data.items)}
			version={state.data.version}
			roles={roles}
			transactions={toTransactions(ledger.status === 'ok' ? ledger.data : EMPTY_LEDGER)}
			now={new Date().toISOString()}
		/>
	);
}
