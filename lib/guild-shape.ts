import { redirect } from 'next/navigation';
import { cache } from 'react';
import { apiGet } from '@/lib/api';
import type { GuildChannelDto, GuildChannelListDto, GuildRoleListDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
import type { Channel, ChannelKind, Role } from '@/lib/types/discord';

export const CHANNEL_CATEGORY = 4;

export const UNCATEGORISED = 'No category';

const KINDS: Record<number, ChannelKind> = {
	0: 'text',
	2: 'voice',
	5: 'announcement',
	15: 'forum'
};

const kindOf = (type: number): ChannelKind | null => KINDS[type] ?? null;

const unwrap = <T>(result: Awaited<ReturnType<typeof apiGet<T>>>, path: string): T => {
	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(`${path}: ${result.reason}`, result.answered);
	}

	return result.data;
};

export function toChannels(dtos: readonly GuildChannelDto[]): Channel[] {
	const categories = new Map(
		dtos.filter((dto) => dto.type === CHANNEL_CATEGORY).map((dto) => [dto.id, dto.name])
	);

	return dtos.flatMap((dto) => {
		const kind = kindOf(dto.type);

		if (kind === null) return [];

		const named = dto.parentId === null ? undefined : categories.get(dto.parentId);
		const categoryId = named === undefined ? null : dto.parentId;

		return [{ id: dto.id, name: dto.name, categoryId, category: named ?? UNCATEGORISED, kind }];
	});
}

export const loadChannels = cache(async (guildId: string): Promise<Channel[]> => {
	const path = `/guilds/${guildId}/channels`;

	return toChannels(unwrap(await apiGet<GuildChannelListDto>(path), path).channels);
});

export const loadRoles = cache(async (guildId: string): Promise<Role[]> => {
	const path = `/guilds/${guildId}/roles`;
	const { roles } = unwrap(await apiGet<GuildRoleListDto>(path), path);

	return roles
		.filter((role) => !role.everyone)
		.map((role) => ({
			id: role.id,
			name: role.name,
			color: role.color === '#000000' ? '#99aab5' : role.color,
			...(role.managed
				? { lockedReason: 'Discord manages this role, so it cannot be given out' }
				: {})
		}));
});
