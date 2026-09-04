import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ChannelKind } from '@/lib/types/discord';
import type { LeaderboardEntry, LevelsConfig, RoleReward } from '@/lib/types/module-configs';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';
import { toEmbedDraft } from './welcome';

export const MAX_REWARDS = 50;

export const MIN_REWARD_LEVEL = 1;

export const MAX_REWARD_LEVEL = 999;

export const MAX_XP_PER_MESSAGE = 500;

export const MAX_COOLDOWN_SECONDS = 3600;

export const MAX_VOICE_XP_PER_MINUTE = 100;

export const MIN_CURVE = 10;

export const MAX_CURVE = 500;

export const MAX_ANNOUNCE_LENGTH = 2000;

export const ANNOUNCE_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export type LevelRewardDto = {
	level: number;
	roleId: string;
	removePrevious: boolean;
};

export type LeaderboardEntryDto = {
	rank: number;
	userId: string;
	username: string | null;
	globalName: string | null;
	avatarHash: string | null;
	xp: number;
	level: number;
	totalMessages: number;
};

export type LeaderboardDto = {
	entries: LeaderboardEntryDto[];
	members: number;
};

export function levelVariables(guildName: string): MessageVariable[] {
	return [
		{ token: '{user}', key: 'user', sample: 'novato' },
		{ token: '{user.mention}', key: 'userMention', sample: '@novato' },
		{ token: '{level}', key: 'level', sample: '7' },
		{ token: '{server}', key: 'server', sample: guildName }
	];
}

const asString = (value: unknown, fallback: string): string =>
	typeof value === 'string' ? value : fallback;

const asBoolean = (value: unknown): boolean => value === true;

const asSnowflakeList = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const asWhole = (value: unknown, fallback: number, low: number, high: number): number =>
	typeof value === 'number' && Number.isFinite(value)
		? Math.min(high, Math.max(low, Math.round(value)))
		: fallback;

export const rewardId = (reward: { level: number; roleId: string }): string =>
	`${String(reward.level)}:${reward.roleId}`;

export function toLevelsConfig(
	state: GuildModuleStateDto,
	rewards: readonly LevelRewardDto[],
	defaultColor?: string
): LevelsConfig {
	const { config } = state;

	const announceMessage: MessageDraft = {
		mode: asBoolean(config.announceUseEmbed) ? 'embed' : 'text',
		text: asString(config.announceMessage, ''),
		embed: toEmbedDraft(config.announceEmbed, defaultColor)
	};

	const low = asWhole(config.xpMin, 15, 0, MAX_XP_PER_MESSAGE);
	const high = asWhole(config.xpMax, 25, 0, MAX_XP_PER_MESSAGE);

	return {
		enabled: state.enabled,
		xpMin: low,
		xpMax: high,
		cooldownSeconds: asWhole(config.cooldownSeconds, 60, 0, MAX_COOLDOWN_SECONDS),
		voiceXpPerMinute: asWhole(config.voiceXpPerMinute, 0, 0, MAX_VOICE_XP_PER_MINUTE),
		curve: asWhole(config.curve, 100, MIN_CURVE, MAX_CURVE),
		announce: asBoolean(config.announce),
		announceChannelId:
			typeof config.announceChannelId === 'string' ? config.announceChannelId : null,
		announceInPlace: asBoolean(config.announceInPlace),
		announceMessage,
		rewards: rewards.map((reward) => ({
			id: rewardId(reward),
			level: reward.level,
			roleId: reward.roleId,
			removePrevious: reward.removePrevious
		})),
		noXpChannelIds: asSnowflakeList(config.noXpChannelIds),
		noXpRoleIds: asSnowflakeList(config.noXpRoleIds)
	};
}

export function toLevelsPatch(config: LevelsConfig): Record<string, unknown> {
	return {
		xpMin: Math.min(config.xpMin, config.xpMax),
		xpMax: Math.max(config.xpMin, config.xpMax),
		cooldownSeconds: config.cooldownSeconds,
		voiceXpPerMinute: config.voiceXpPerMinute,
		curve: config.curve,
		announce: config.announce,
		announceChannelId: config.announceChannelId,
		announceInPlace: config.announceInPlace,
		announceMessage: config.announceMessage.text.slice(0, MAX_ANNOUNCE_LENGTH),
		announceUseEmbed: config.announceMessage.mode === 'embed',
		announceEmbed: config.announceMessage.embed,
		noXpChannelIds: config.noXpChannelIds,
		noXpRoleIds: config.noXpRoleIds
	};
}

export const roleless = (rewards: readonly RoleReward[]): number =>
	rewards.filter((reward) => reward.roleId === null).length;

export function toRewardPayload(rewards: readonly RoleReward[]): LevelRewardDto[] {
	const seen = new Set<string>();

	return rewards
		.filter((reward): reward is RoleReward & { roleId: string } => reward.roleId !== null)
		.map((reward) => ({
			level: Math.min(MAX_REWARD_LEVEL, Math.max(MIN_REWARD_LEVEL, Math.round(reward.level))),
			roleId: reward.roleId,
			removePrevious: reward.removePrevious
		}))
		.filter((reward) => {
			const pair = rewardId(reward);

			if (seen.has(pair)) return false;

			seen.add(pair);

			return true;
		})
		.slice(0, MAX_REWARDS);
}

const initialsOf = (name: string): string => name.slice(0, 2).toUpperCase();

const COLOURS = ['#5865f2', '#0d9488', '#d97706', '#db2777', '#57f287', '#eb459e'];

export const colourFor = (userId: string): string => {
	const digits = userId.replace(/\D/g, '');
	const tail = Number(digits.slice(-4) || '0');

	return COLOURS[tail % COLOURS.length] ?? COLOURS[0] ?? '#5865f2';
};

export function toLeaderboard(board: LeaderboardDto): LeaderboardEntry[] {
	return board.entries.map((entry) => {
		const name = entry.globalName ?? entry.username ?? entry.userId;

		return {
			rank: entry.rank,
			name,
			initials: initialsOf(name),
			color: colourFor(entry.userId),
			level: entry.level,
			xp: entry.xp
		};
	});
}
