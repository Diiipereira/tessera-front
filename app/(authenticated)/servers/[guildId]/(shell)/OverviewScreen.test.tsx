import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { BRAND } from '@/lib/brand';
import type { SupportedLocale } from '@/lib/locale';
import type { DayPointDto, OverviewDto } from '@/lib/overview';
import type { Guild } from '@/lib/types/guild';
import type { AuditEntry } from '@/lib/types/management';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { OverviewScreen } from './OverviewScreen';

const KEY_PATH = /(?:overview|servers|auth|shell|nav|common|audit)\.[a-z]+(?:\.[a-z]+)+/i;

const NOW = '2026-09-04T12:00:00.000Z';

const guild: Guild = {
	id: '842315097461823104',
	name: 'Comunidade CJ GAMES',
	initials: 'CJ',
	color: '#5865f2',
	iconUrl: null,
	memberCount: 195,
	hasBot: true,
	reachedBySeat: false,
	tier: 'free',
	missingPermissions: []
};

const day = (index: number, patch: Partial<DayPointDto> = {}): DayPointDto => ({
	day: new Date(Date.UTC(2026, 5, 7) + index * 86_400_000).toISOString().slice(0, 10),
	messages: 0,
	commands: 0,
	joins: 0,
	leaves: 0,
	modActions: 0,
	ticketsOpened: 0,
	...patch
});

const series = (patch: (index: number) => Partial<DayPointDto> = () => ({})): DayPointDto[] =>
	Array.from({ length: 90 }, (_unused, index) => day(index, patch(index)));

const overview = (patch: Partial<OverviewDto> = {}): OverviewDto => ({
	memberCount: 12431,
	openTickets: 6,
	setupCompleted: true,
	modules: { enabled: 8, total: 10, needingSetup: 3 },
	checklist: [
		{ key: 'welcome', done: true },
		{ key: 'moderation', done: false },
		{ key: 'logging', done: false }
	],
	series: series(),
	bot: null,
	...patch
});

const entry = (patch: Partial<AuditEntry> = {}): AuditEntry => ({
	id: 'a1',
	moduleKey: 'welcome',
	path: 'welcome.channelId',
	before: null,
	after: '801234567890123001',
	actor: { id: '304918273645102938', name: 'Lia', avatarHash: null },
	source: 'web',
	at: '2026-09-04T11:30:00.000Z',
	...patch
});

function renderOverview(
	locale: SupportedLocale,
	patch: Partial<OverviewDto> = {},
	audit: AuditEntry[] = [entry()]
) {
	render(
		<Translated locale={locale}>
			<ThemeProvider>
				<OverviewScreen guild={guild} overview={overview(patch)} audit={audit} now={NOW} />
			</ThemeProvider>
		</Translated>
	);
}

const card = (label: string): HTMLElement => {
	const found = screen.getByText(label).closest('div');

	if (found === null) throw new Error(`no card around ${label}`);

	return found.parentElement ?? found;
};

describe('OverviewScreen', () => {
	it('names every stat, so no card shows a number without a label', () => {
		renderOverview('en-US');

		for (const label of Object.values(enUS.overview.stats).filter(
			(value) => !value.includes('{')
		)) {
			expect(screen.getByText(label)).toBeInTheDocument();
		}
	});

	it('shows the member count the API measured', () => {
		renderOverview('en-US');

		expect(within(card(enUS.overview.stats.members)).getByText('12,431')).toBeInTheDocument();
	});

	it('adds up the commands of the last seven days, not of the whole quarter', () => {
		renderOverview('en-US', { series: series(() => ({ commands: 2 })) });

		expect(within(card(enUS.overview.stats.commands)).getByText('14')).toBeInTheDocument();
	});

	it('reads growth as the joins that stayed, with a sign', () => {
		renderOverview('en-US', {
			series: series((index) => (index >= 83 ? { joins: 10, leaves: 4 } : {}))
		});

		expect(screen.getByText('+42 this week')).toBeInTheDocument();
	});

	it('says a shrinking week is a loss instead of dropping the sign', () => {
		renderOverview('en-US', {
			series: series((index) => (index >= 83 ? { leaves: 3 } : {}))
		});

		expect(screen.getByText('-21 this week')).toBeInTheDocument();
	});

	it('says there is nothing to compare with when the week before was empty', () => {
		renderOverview('en-US', {
			series: series((index) => (index >= 83 ? { commands: 5 } : {}))
		});

		expect(screen.getByText(enUS.overview.stats.noComparison)).toBeInTheDocument();
	});

	it('counts the modules that are on out of the ones that exist', () => {
		renderOverview('en-US');

		expect(screen.getByText('8 of 10')).toBeInTheDocument();
		expect(screen.getByText('3 need setup')).toBeInTheDocument();
	});

	it('says the bot never reported instead of drawing an empty status card', () => {
		renderOverview('en-US');

		expect(
			screen.getByText(enUS.overview.status.neverReported.replace('{brand}', BRAND.name))
		).toBeInTheDocument();
		expect(screen.getByText(enUS.overview.status.unknown)).toBeInTheDocument();
	});

	it('shows the uptime and latency once a beat arrived', () => {
		renderOverview('en-US', {
			bot: {
				online: true,
				uptimeSeconds: 9 * 86_400 + 4 * 3600,
				latencyMs: 47,
				shards: 1,
				seenAt: NOW
			}
		});

		expect(screen.getByText('9d 4h')).toBeInTheDocument();
		expect(screen.getByText('47 ms')).toBeInTheDocument();
		expect(screen.getByText(enUS.overview.status.online)).toBeInTheDocument();
	});

	it('says the bot is down when the beat went stale', () => {
		renderOverview('en-US', {
			bot: { online: false, uptimeSeconds: 60, latencyMs: 0, shards: 1, seenAt: NOW }
		});

		expect(screen.getByText(enUS.overview.status.offline)).toBeInTheDocument();
	});

	it('shows the setup checklist only while setup is unfinished', () => {
		renderOverview('en-US', { setupCompleted: false });

		expect(screen.getByText(enUS.overview.setup.moderation.label)).toBeInTheDocument();
	});

	it('hides the checklist once the wizard has been through', () => {
		renderOverview('en-US');

		expect(screen.queryByText(enUS.overview.setup.moderation.label)).not.toBeInTheDocument();
	});

	it('reads the recent activity out of the audit log, naming who changed what', () => {
		renderOverview('en-US');

		expect(screen.getByText('Lia')).toBeInTheDocument();
		expect(screen.getByText(enUS.audit.sources.web)).toBeInTheDocument();
	});

	it('says the log is empty instead of showing an empty list', () => {
		renderOverview('en-US', {}, []);

		expect(screen.getByText(enUS.overview.feed.empty)).toBeInTheDocument();
	});

	it('speaks Portuguese to a Portuguese reader', () => {
		renderOverview('pt-BR');

		expect(screen.getByRole('heading', { name: ptBR.overview.title })).toBeInTheDocument();
		expect(screen.getByText(ptBR.overview.feed.title)).toBeInTheDocument();
		expect(screen.getByText(ptBR.overview.quick.title)).toBeInTheDocument();
		expect(
			screen.getByText(ptBR.overview.status.title.replace('{brand}', BRAND.name))
		).toBeInTheDocument();
	});

	it('leaks no message key into the page, which is how a missing translation shows up', () => {
		renderOverview('pt-BR', { setupCompleted: false });

		expect(document.body.textContent).not.toMatch(KEY_PATH);
	});
});
