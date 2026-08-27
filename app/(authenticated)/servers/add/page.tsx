import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BRAND } from '@/lib/brand';
import { botInviteUrl } from '@/lib/discord-invite';
import { loadGuilds } from '@/lib/guild-access';
import { guildHref } from '@/lib/navigation';
import { AddServerScreen } from './AddServerScreen';

export const metadata: Metadata = { title: `Adding ${BRAND.name}` };

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const guildId = typeof params.guild === 'string' ? params.guild : null;
	const joined = params.state === 'joined';

	if (guildId === null) {
		return <AddServerScreen guild={null} joined={joined} inviteHref={botInviteUrl()} />;
	}

	const { managed, available } = await loadGuilds();
	const arrived = managed.find((guild) => guild.id === guildId);

	if (arrived !== undefined) redirect(guildHref(arrived.id, ''));

	return (
		<AddServerScreen
			guild={available.find((guild) => guild.id === guildId) ?? null}
			joined={joined}
			inviteHref={botInviteUrl(guildId)}
		/>
	);
}
