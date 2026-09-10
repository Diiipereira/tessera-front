import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { resolveGuild } from '@/lib/guild-access';
import { CustomCommandsSkeleton } from '@/components/skeletons/CustomCommandsSkeleton';
import { mockCustomCommandsConfig, mockRoles, mockVariables } from '@/lib/mock';
import type { GuildPageProps } from '@/lib/types/page';
import { CustomCommandsScreen } from './CustomCommandsScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('modules.customCommands');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <CustomCommandsSkeleton />;

	return (
		<CustomCommandsScreen
			config={mockCustomCommandsConfig}
			roles={mockRoles}
			variables={mockVariables}
		/>
	);
}
