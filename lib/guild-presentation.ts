import type { AuthenticatedUserDto, GuildCardDto } from '@/lib/api-url';
import { guildIconUrl, userAvatarUrl } from '@/lib/discord-cdn';
import type { Guild } from '@/lib/types/guild';
import type { PlanTier } from '@/lib/types/billing';
import type { SessionUser } from '@/lib/types/session';

const PALETTE = [
	'#8b5cf6',
	'#f87171',
	'#4ade80',
	'#fbbf24',
	'#38bdf8',
	'#f472b6',
	'#2dd4bf',
	'#fb923c',
	'#a78bfa',
	'#60a5fa'
] as const;

export function initialsOf(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);

	if (words.length === 0) return '??';
	if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase();

	return `${(words[0] ?? '').charAt(0)}${(words[1] ?? '').charAt(0)}`.toUpperCase();
}

export function colorOf(id: string): string {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 1_000_003;

	return PALETTE[hash % PALETTE.length] ?? PALETTE[0];
}

export function tierOf(planKey: string | null): PlanTier {
	if (planKey === 'pro' || planKey === 'ultimate') return planKey;
	return 'free';
}

export function toGuild(dto: GuildCardDto, hasBot: boolean): Guild {
	return {
		id: dto.id,
		name: dto.name,
		initials: initialsOf(dto.name),
		color: colorOf(dto.id),
		iconUrl: guildIconUrl(dto.id, dto.iconHash),
		memberCount: dto.memberCount ?? 0,
		hasBot,
		tier: tierOf(dto.planKey)
	};
}

export function toSessionUser(dto: AuthenticatedUserDto): SessionUser {
	const displayName = dto.globalName ?? dto.username;

	return {
		id: dto.id,
		displayName,
		handle: `@${dto.username}`,
		initials: initialsOf(displayName),
		color: colorOf(dto.id),
		avatarUrl: userAvatarUrl(dto.id, dto.avatarHash)
	};
}
