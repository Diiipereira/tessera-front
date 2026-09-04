import { redirect } from 'next/navigation';
import { CommandsSkeleton } from '@/components/skeletons/CommandsSkeleton';
import { apiGet, type ApiResult } from '@/lib/api';
import type { CommandReportDto } from '@/lib/command-report';
import { ApiUnreachableError } from '@/lib/guild-access';
import type { GuildPageProps } from '@/lib/types/page';
import { CommandsScreen } from './CommandsScreen';

export const metadata = { title: 'Commands' };

function unwrap<T>(result: ApiResult<T>): T {
	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered, result.code ?? null);
	}

	return result.data;
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	if (query.state === 'loading') return <CommandsSkeleton />;

	const report = await apiGet<CommandReportDto>(`/guilds/${guildId}/commands`);

	return (
		<CommandsScreen guildId={guildId} report={unwrap(report)} now={new Date().toISOString()} />
	);
}
