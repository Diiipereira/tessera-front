import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HELP_CARDS, FOOTER_COLUMNS, NAV_LINKS } from '@/lib/marketing';
import { configuredUrl, STATUS_HREF, SUPPORT_HREF } from './support-links';

const INVENTED = /discord\.gg\/placeholder|placeholder\.dev/;

const SOURCES = [
	'lib/brand.ts',
	'lib/marketing.ts',
	'lib/support-links.ts',
	'components/layout/UserMenu.tsx',
	'components/layout/AccountBar.tsx',
	'components/layout/BotOfflineBanner.tsx'
];

type Outbound = { id: string; href: string | null };

const EVERY_LINK: Outbound[] = [
	...NAV_LINKS,
	...FOOTER_COLUMNS.flatMap<Outbound>((column) => [...column.links]),
	...HELP_CARDS
];

const hrefOf = (id: string): string | null | undefined =>
	EVERY_LINK.find((link) => link.id === id)?.href;

describe('support and status links', () => {
	it('has no link while the environment does not name one', () => {
		expect(configuredUrl(undefined)).toBeNull();
		expect(configuredUrl('')).toBeNull();
		expect(configuredUrl('   ')).toBeNull();
	});

	it('uses what the environment names, so the real server needs no code change', () => {
		expect(configuredUrl('https://discord.gg/tessera')).toBe('https://discord.gg/tessera');
	});

	it('points nowhere in this build, because neither server exists yet', () => {
		expect(SUPPORT_HREF).toBeNull();
		expect(STATUS_HREF).toBeNull();
	});

	it('never hardcodes an address nobody owns', () => {
		const guilty = SOURCES.filter((path) =>
			INVENTED.test(readFileSync(join(process.cwd(), path), 'utf8'))
		);

		expect(guilty).toEqual([]);
	});

	it('leaves every screen that offered support pointing nowhere, not at an invented server', () => {
		const hrefs = ['support', 'supportServer', 'status'].map((id) => hrefOf(id));

		expect(hrefs).toEqual([null, null, null]);
	});

	it('keeps the bot invite, which is built from the client id and is real', () => {
		expect(hrefOf('invite')).toContain('discord.com/oauth2/authorize');
	});
});
