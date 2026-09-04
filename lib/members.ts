import { colorOf, initialsOf } from '@/lib/guild-presentation';
import type { Member, MemberStanding } from '@/lib/types/management';

export const MEMBER_SORTS = ['active', 'level', 'balance', 'warnings', 'name'] as const;

export type MemberSort = (typeof MEMBER_SORTS)[number];

export const MEMBER_STANDINGS = ['clean', 'warned', 'timed-out', 'banned'] as const;

export const DEFAULT_MEMBER_SORT: MemberSort = 'active';

export const MEMBERS_PER_PAGE = 25;

export const MAX_MEMBER_SEARCH = 50;

export type MemberDto = {
	id: string;
	name: string | null;
	handle: string | null;
	avatarHash: string | null;
	level: number;
	xp: number;
	earningMessages: number;
	voiceSeconds: number;
	lastEarnedAt: string | null;
	balance: number;
	warnings: number;
	infractions: number;
	standing: MemberStanding;
};

export type MemberListDto = {
	members: MemberDto[];
	total: number;
	searched: boolean;
};

export type MemberDetailDto = {
	member: MemberDto;
	present: boolean;
	nickname: string | null;
	bot: boolean;
	roleIds: string[];
	joinedAt: string | null;
	timedOutUntil: string | null;
};

export type MemberQuery = {
	query: string;
	standing: MemberStanding | 'all';
	sort: MemberSort;
	page: number;
};

export const blankMemberQuery: MemberQuery = {
	query: '',
	standing: 'all',
	sort: DEFAULT_MEMBER_SORT,
	page: 0
};

export function toMember(dto: MemberDto): Member {
	const name = dto.name ?? dto.handle ?? dto.id;

	return {
		id: dto.id,
		name,
		handle: dto.handle === null ? dto.id : `@${dto.handle}`,
		initials: initialsOf(name),
		color: colorOf(dto.id),
		avatarHash: dto.avatarHash,
		level: dto.level,
		xp: dto.xp,
		earningMessages: dto.earningMessages,
		voiceSeconds: dto.voiceSeconds,
		lastEarnedAt: dto.lastEarnedAt,
		balance: dto.balance,
		warnings: dto.warnings,
		infractions: dto.infractions,
		standing: dto.standing
	};
}

export const toMembers = (dtos: readonly MemberDto[]): Member[] => dtos.map(toMember);

export function toSearchParams(query: MemberQuery): URLSearchParams {
	const params = new URLSearchParams();
	const term = query.query.trim();

	if (term === '') {
		params.set('sort', query.sort);
		params.set('limit', String(MEMBERS_PER_PAGE));
		params.set('offset', String(query.page * MEMBERS_PER_PAGE));
	} else {
		params.set('query', term);
		params.set('limit', String(MAX_MEMBER_SEARCH));
	}

	if (query.standing !== 'all') params.set('standing', query.standing);

	return params;
}

export const isSearching = (query: MemberQuery): boolean => query.query.trim() !== '';

export const pageCount = (total: number): number =>
	Math.max(1, Math.ceil(total / MEMBERS_PER_PAGE));

export const firstShown = (page: number, shown: number): number =>
	shown === 0 ? 0 : page * MEMBERS_PER_PAGE + 1;

export const lastShown = (page: number, shown: number): number => page * MEMBERS_PER_PAGE + shown;
