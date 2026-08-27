import { describe, expect, it } from 'vitest';
import {
	breadcrumbsFor,
	findActiveNavItem,
	findNavItem,
	guildHref,
	navGroups
} from '@/lib/navigation';

const GUILD = '842315097461823104';

describe('guildHref', () => {
	it('builds the overview path with an empty suffix', () => {
		expect(guildHref(GUILD, '')).toBe(`/servers/${GUILD}`);
	});

	it('appends the module suffix', () => {
		expect(guildHref(GUILD, '/modules/welcome')).toBe(`/servers/${GUILD}/modules/welcome`);
	});
});

describe('findNavItem', () => {
	it('matches a module route exactly', () => {
		expect(findNavItem(GUILD, `/servers/${GUILD}/modules/welcome`)?.id).toBe('welcome');
	});

	it('does not match the modules index from a module page', () => {
		expect(findNavItem(GUILD, `/servers/${GUILD}/modules`)?.id).toBe('modules');
	});

	it('returns undefined for an unknown route', () => {
		expect(findNavItem(GUILD, `/servers/${GUILD}/nope`)).toBeUndefined();
	});
});

describe('findActiveNavItem', () => {
	it('matches a route exactly, like findNavItem does', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}/cases`)?.id).toBe('cases');
	});

	it('matches a detail route to the section it belongs to', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}/cases/42`)?.id).toBe('cases');
	});

	it('prefers the longest matching path, so a module wins over the index', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}/modules/welcome`)?.id).toBe('welcome');
	});

	it('does not let the empty overview path swallow every route', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}/cases`)?.id).not.toBe('overview');
	});

	it('still matches the overview itself', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}`)?.id).toBe('overview');
	});

	it('returns undefined for a route outside the nav', () => {
		expect(findActiveNavItem(GUILD, `/servers/${GUILD}/nope`)).toBeUndefined();
	});
});

describe('breadcrumbsFor', () => {
	it('gives a single crumb outside the modules group', () => {
		expect(breadcrumbsFor(GUILD, `/servers/${GUILD}/audit`)).toEqual([
			{ kind: 'nav', id: 'audit' }
		]);
	});

	it('links back to the section from a detail route', () => {
		expect(breadcrumbsFor(GUILD, `/servers/${GUILD}/cases/42`)).toEqual([
			{ kind: 'nav', id: 'cases', href: `/servers/${GUILD}/cases` },
			{ kind: 'text', text: '#42' }
		]);
	});

	it('prepends Modules for a module page', () => {
		expect(breadcrumbsFor(GUILD, `/servers/${GUILD}/modules/welcome`)).toEqual([
			{ kind: 'nav', id: 'modules', href: `/servers/${GUILD}/modules` },
			{ kind: 'nav', id: 'welcome' }
		]);
	});

	it('carries the id, not human text, so the label can be translated', () => {
		const crumbs = breadcrumbsFor(GUILD, `/servers/${GUILD}/modules/welcome`);

		expect(JSON.stringify(crumbs)).not.toContain('Welcome');
	});
});

describe('navGroups', () => {
	it('keeps the four groups the design specifies', () => {
		expect(navGroups.map((group) => group.id)).toEqual([
			'overview',
			'modules',
			'management',
			'server'
		]);
	});

	it('has 20 destinations in total', () => {
		expect(navGroups.flatMap((group) => group.items)).toHaveLength(20);
	});
});
