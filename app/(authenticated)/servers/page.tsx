import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountBar } from '@/components/layout/AccountBar';
import { Alert } from '@/components/ui/Alert';
import { apiGet } from '@/lib/api';
import type { AuthenticatedUserDto, GuildListDto } from '@/lib/api-url';
import { toGuild, toSessionUser } from '@/lib/guild-presentation';
import { mockUser } from '@/lib/mock';
import { ServerPicker } from './ServerPicker';

export const metadata: Metadata = { title: 'Your servers' };

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const state = typeof params.state === 'string' ? params.state : null;

	if (state === 'loading' || state === 'empty') {
		return (
			<div className="flex min-h-svh flex-col">
				<AccountBar user={mockUser} />
				<ServerPicker guilds={[]} loading={state === 'loading'} empty={state === 'empty'} />
			</div>
		);
	}

	const [guildsResult, meResult] = await Promise.all([
		apiGet<GuildListDto>('/guilds'),
		apiGet<AuthenticatedUserDto>('/auth/me')
	]);

	if (guildsResult.status === 'unauthenticated') redirect('/login');

	const user = meResult.status === 'ok' ? toSessionUser(meResult.data) : null;

	if (guildsResult.status === 'unreachable') {
		return (
			<div className="flex min-h-svh flex-col">
				<AccountBar user={user} />
				<div className="mx-auto w-full max-w-4xl p-6 sm:p-10">
					<Alert variant="danger" title="The API did not answer">
						{guildsResult.reason}. Start it with <code className="font-mono">npm run dev:api</code>{' '}
						in the bot-api repository, then reload this page.
					</Alert>
				</div>
			</div>
		);
	}

	const guilds = [
		...guildsResult.data.managed.map((guild) => toGuild(guild, true)),
		...guildsResult.data.available.map((guild) => toGuild(guild, false))
	];

	return (
		<div className="flex min-h-svh flex-col">
			<AccountBar user={user} />
			<ServerPicker guilds={guilds} loading={false} empty={guilds.length === 0} />
		</div>
	);
}
