import { describe, expect, it } from 'vitest';
import { toBlacklistEntries, toTenantDetail, toTenantSummary } from './admin-presentation';
import type { BlacklistEntryDto, TenantDetailDto, TenantSummaryDto } from './api-url';

const GUILD_ID = '842315097461823104';
const OWNER_ID = '204255221017214977';

const summary = (patch: Partial<TenantSummaryDto> = {}): TenantSummaryDto => ({
	id: GUILD_ID,
	name: 'Pixel Foundry',
	iconHash: null,
	ownerId: OWNER_ID,
	ownerName: 'kaya',
	memberCount: 12431,
	planKey: 'pro',
	locale: 'pt-BR',
	setupCompleted: true,
	joinedAt: '2026-02-11T09:14:00.000Z',
	leftAt: null,
	...patch
});

const detail = (patch: Partial<TenantDetailDto> = {}): TenantDetailDto => ({
	summary: summary(),
	modules: [],
	staff: [],
	activity: [],
	subscription: null,
	...patch
});

const entry = (patch: Partial<BlacklistEntryDto> = {}): BlacklistEntryDto => ({
	targetType: 'user',
	targetId: '399201847562910384',
	name: 'raid-account-01',
	reason: 'Mass DM advertising',
	createdByName: 'diogo',
	createdAt: '2026-08-19T21:12:00.000Z',
	expiresAt: null,
	...patch
});

describe('toTenantSummary', () => {
	it('derives the avatar the API does not send, because it is presentation', () => {
		const tenant = toTenantSummary(summary());

		expect(tenant.initials).toBe('PF');
		expect(tenant.color).toMatch(/^#[0-9a-f]{6}$/);
	});

	it('shows the owner id when Discord does not know the name, instead of an empty cell', () => {
		expect(toTenantSummary(summary({ ownerName: null })).ownerName).toBe(OWNER_ID);
	});

	it('reads a plan it does not know as free, which is what an unpaid guild is', () => {
		expect(toTenantSummary(summary({ planKey: 'enterprise' })).planKey).toBe('free');
		expect(toTenantSummary(summary({ planKey: 'pro' })).planKey).toBe('pro');
	});
});

describe('toTenantDetail', () => {
	it('skips a module the dashboard cannot draw, the way the module index already does', () => {
		const mapped = toTenantDetail(
			detail({
				modules: [
					{ key: 'welcome', enabled: true, version: 1, updatedAt: null, updatedByName: null },
					{ key: 'not-a-module', enabled: true, version: 1, updatedAt: null, updatedByName: null }
				]
			})
		);

		expect(mapped.modules.map((module) => module.key)).toEqual(['welcome']);
	});

	it('narrows a role and a source it does not know instead of trusting the wire', () => {
		const mapped = toTenantDetail(
			detail({
				staff: [
					{
						userId: OWNER_ID,
						name: 'kaya',
						avatarHash: null,
						role: 'superuser',
						source: 'telepathy',
						grantedAt: null
					}
				]
			})
		);

		expect(mapped.staff[0]).toMatchObject({ role: 'viewer', source: 'guild-staff' });
	});

	it('keeps the subscription null while billing does not exist', () => {
		expect(toTenantDetail(detail()).subscription).toBeNull();
	});
});

describe('toBlacklistEntries', () => {
	it('names the target by id when nobody could resolve it', () => {
		const [mapped] = toBlacklistEntries([entry({ name: null })]);

		expect(mapped?.name).toBe('399201847562910384');
	});

	it('marks an author the platform never recorded, rather than inventing one', () => {
		const [mapped] = toBlacklistEntries([entry({ createdByName: null })]);

		expect(mapped?.createdByName).toBe('—');
	});

	it('drops a target type the screen has no column for', () => {
		const mapped = toBlacklistEntries([entry(), entry({ targetType: 'channel' })]);

		expect(mapped).toHaveLength(1);
		expect(mapped[0]?.targetType).toBe('user');
	});

	it('keeps a banned guild, which is the whole point of the table', () => {
		const mapped = toBlacklistEntries([
			entry({ targetType: 'guild', targetId: GUILD_ID, name: 'Raid Central' })
		]);

		expect(mapped[0]).toMatchObject({ targetType: 'guild', name: 'Raid Central' });
	});
});
