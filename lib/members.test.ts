import { describe, expect, it } from 'vitest';
import {
	MAX_MEMBER_SEARCH,
	MEMBERS_PER_PAGE,
	blankMemberQuery,
	firstShown,
	isSearching,
	lastShown,
	pageCount,
	toMember,
	toMembers,
	toSearchParams,
	type MemberDto,
	type MemberQuery
} from './members';

const ALICE = '304918273645102938';

const dto = (patch: Partial<MemberDto> = {}): MemberDto => ({
	id: ALICE,
	name: 'Alice',
	handle: 'alice',
	avatarHash: 'abc',
	level: 4,
	xp: 1600,
	earningMessages: 42,
	voiceSeconds: 600,
	lastEarnedAt: '2026-09-01T12:00:00.000Z',
	balance: 1240,
	warnings: 2,
	infractions: 5,
	standing: 'warned',
	...patch
});

const query = (patch: Partial<MemberQuery> = {}): MemberQuery => ({
	...blankMemberQuery,
	...patch
});

const read = (patch: Partial<MemberQuery> = {}): Record<string, string> =>
	Object.fromEntries(toSearchParams(query(patch)));

describe('toMember', () => {
	it('carries what the API measured', () => {
		expect(toMember(dto())).toMatchObject({
			id: ALICE,
			level: 4,
			xp: 1600,
			earningMessages: 42,
			voiceSeconds: 600,
			balance: 1240,
			warnings: 2,
			infractions: 5,
			standing: 'warned'
		});
	});

	it('shows the handle with the at sign a person expects', () => {
		expect(toMember(dto()).handle).toBe('@alice');
	});

	it('falls back to the handle when nobody set a display name', () => {
		expect(toMember(dto({ name: null })).name).toBe('alice');
	});

	it('falls back to the id, so a row is never nameless', () => {
		expect(toMember(dto({ name: null, handle: null }))).toMatchObject({
			name: ALICE,
			handle: ALICE
		});
	});

	it('gives every member an avatar to fall back on', () => {
		const member = toMember(dto());

		expect(member.initials).toBe('AL');
		expect(member.color).toMatch(/^#[0-9a-f]{6}$/i);
	});

	it('keeps the same colour for the same person', () => {
		expect(toMember(dto()).color).toBe(toMember(dto({ name: 'Other' })).color);
	});

	it('keeps the moment the API sent, without reading it', () => {
		expect(toMember(dto()).lastEarnedAt).toBe('2026-09-01T12:00:00.000Z');
		expect(toMember(dto({ lastEarnedAt: null })).lastEarnedAt).toBeNull();
	});

	it('maps a whole page in order', () => {
		expect(toMembers([dto(), dto({ id: '1', name: 'Bruno' })]).map((entry) => entry.name)).toEqual([
			'Alice',
			'Bruno'
		]);
	});
});

describe('toSearchParams', () => {
	it('asks for the first page sorted the way the screen opens', () => {
		expect(read()).toEqual({
			sort: 'active',
			limit: String(MEMBERS_PER_PAGE),
			offset: '0'
		});
	});

	it('turns the page number into the offset the API takes', () => {
		expect(read({ page: 3 }).offset).toBe(String(MEMBERS_PER_PAGE * 3));
	});

	it('sends the standing only when one was picked', () => {
		expect(read()).not.toHaveProperty('standing');
		expect(read({ standing: 'banned' }).standing).toBe('banned');
	});

	it('sends a search instead of a page, since a search is capped', () => {
		const params = read({ query: 'lia' });

		expect(params).toMatchObject({ query: 'lia', limit: String(MAX_MEMBER_SEARCH) });
		expect(params).not.toHaveProperty('offset');
		expect(params).not.toHaveProperty('sort');
	});

	it('never sends a sort with a search, which the API refuses', () => {
		expect(read({ query: 'lia', sort: 'balance' })).not.toHaveProperty('sort');
	});

	it('never sends a page with a search, which the API refuses', () => {
		expect(read({ query: 'lia', page: 4 })).not.toHaveProperty('offset');
	});

	it('reads a search of nothing but spaces as no search at all', () => {
		expect(read({ query: '   ' })).toMatchObject({ sort: 'active', offset: '0' });
	});

	it('trims the term before sending it', () => {
		expect(read({ query: '  lia  ' }).query).toBe('lia');
	});

	it('keeps the standing filter on a search, which the API does apply', () => {
		expect(read({ query: 'lia', standing: 'warned' }).standing).toBe('warned');
	});
});

describe('isSearching', () => {
	it('knows a real term from an empty box', () => {
		expect(isSearching(query({ query: 'lia' }))).toBe(true);
		expect(isSearching(query())).toBe(false);
		expect(isSearching(query({ query: '  ' }))).toBe(false);
	});
});

describe('counting the pages', () => {
	it('always offers one page, even with nobody on it', () => {
		expect(pageCount(0)).toBe(1);
	});

	it('rounds a partial page up', () => {
		expect(pageCount(MEMBERS_PER_PAGE + 1)).toBe(2);
		expect(pageCount(MEMBERS_PER_PAGE)).toBe(1);
	});

	it('numbers the rows on screen from one, not from zero', () => {
		expect(firstShown(0, 25)).toBe(1);
		expect(lastShown(0, 25)).toBe(25);
	});

	it('numbers the second page from where the first ended', () => {
		expect(firstShown(1, 10)).toBe(MEMBERS_PER_PAGE + 1);
		expect(lastShown(1, 10)).toBe(MEMBERS_PER_PAGE + 10);
	});

	it('says nothing is shown when nothing came back', () => {
		expect(firstShown(0, 0)).toBe(0);
	});
});
