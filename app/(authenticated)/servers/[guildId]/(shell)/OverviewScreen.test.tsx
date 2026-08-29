import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { BRAND } from '@/lib/brand';
import {
	mockActivity,
	mockBotHealth,
	mockRecentActivity,
	mockSetupChecklist,
	mockStats
} from '@/lib/mock';
import type { SupportedLocale } from '@/lib/locale';
import type { Guild } from '@/lib/types/guild';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { OverviewScreen } from './OverviewScreen';

const KEY_PATH = /(?:overview|servers|auth|shell|nav|common)\.[a-z]+(?:\.[a-z]+)+/i;

function stepCopy(id: string): { label: string; action: string } {
	const step: unknown = (enUS.overview.setup as Record<string, unknown>)[id];

	if (typeof step !== 'object' || step === null) throw new Error(`no copy for setup step ${id}`);

	return step as { label: string; action: string };
}

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

function renderOverview(locale: SupportedLocale, setupCompleted = true) {
	render(
		<Translated locale={locale}>
			<ThemeProvider>
				<OverviewScreen
					guild={guild}
					stats={mockStats}
					activity={mockActivity}
					health={mockBotHealth}
					recent={mockRecentActivity}
					checklist={mockSetupChecklist}
					setupCompleted={setupCompleted}
					loading={false}
				/>
			</ThemeProvider>
		</Translated>
	);
}

describe('OverviewScreen', () => {
	it('names every stat, so no card shows a number without a label', () => {
		renderOverview('en-US');

		for (const stat of mockStats) {
			const label = enUS.overview.stats[stat.id as keyof typeof enUS.overview.stats];
			expect(screen.getByText(label)).toBeInTheDocument();
		}
	});

	it('names every unfinished setup step and its button', () => {
		renderOverview('en-US', false);

		for (const item of mockSetupChecklist.filter((entry) => !entry.done)) {
			const step = stepCopy(item.id);
			expect(screen.getByText(step.label)).toBeInTheDocument();
			expect(screen.getByRole('link', { name: step.action })).toBeInTheDocument();
		}
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
		renderOverview('pt-BR', false);

		expect(document.body.textContent).not.toMatch(KEY_PATH);
	});
});
