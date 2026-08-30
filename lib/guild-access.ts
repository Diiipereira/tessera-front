import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { apiGet } from '@/lib/api';
import type { GuildListDto } from '@/lib/api-url';
import { toGuild } from '@/lib/guild-presentation';
import type { Guild } from '@/lib/types/guild';

export type GuildDirectory = {
	managed: Guild[];
	available: Guild[];
};

export class ApiUnreachableError extends Error {
	readonly code: string | null;

	constructor(reason: string, answered = false, code: string | null = null) {
		super(
			answered
				? `The API failed: ${reason}.`
				: `The API did not answer: ${reason}. Start it with "npm run dev:api" in bot-api.`
		);
		this.name = 'ApiUnreachableError';
		this.code = code;
	}
}

export const loadGuilds = cache(async (): Promise<GuildDirectory> => {
	const result = await apiGet<GuildListDto>('/guilds');

	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable')
		throw new ApiUnreachableError(result.reason, result.answered, result.code ?? null);

	return {
		managed: result.data.managed.map((guild) => toGuild(guild, true)),
		available: result.data.available.map((guild) => toGuild(guild, false))
	};
});

export async function lookupGuild(guildId: string): Promise<Guild | null> {
	const { managed } = await loadGuilds();

	return managed.find((guild) => guild.id === guildId) ?? null;
}

export async function lookupPendingGuild(guildId: string): Promise<Guild | null> {
	const { available } = await loadGuilds();

	return available.find((guild) => guild.id === guildId) ?? null;
}

export async function resolveGuild(guildId: string): Promise<Guild> {
	const { managed, available } = await loadGuilds();
	const guild = managed.find((candidate) => candidate.id === guildId);

	if (guild !== undefined) return guild;

	if (available.some((candidate) => candidate.id === guildId)) {
		redirect(`/servers/add?guild=${guildId}`);
	}

	notFound();
}
