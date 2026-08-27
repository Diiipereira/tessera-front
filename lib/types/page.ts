export type GuildPageProps = {
	params: Promise<{ guildId: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};
