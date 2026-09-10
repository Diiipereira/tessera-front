import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import { MODULE_HELP } from '@/lib/module-help';
import { Translated } from '@/tests/i18n';
import { FieldHelp } from './FieldHelp';

const copy = enUS.modules.moderation.escalation.help;

function renderHelp() {
	return render(<FieldHelp {...MODULE_HELP.moderationEscalation} />, { wrapper: Translated });
}

describe('FieldHelp', () => {
	it('keeps the explanation out of the way until it is asked for', () => {
		renderHelp();

		expect(screen.getByRole('button', { name: copy.label })).toBeInTheDocument();
		expect(screen.queryByText(copy.title)).not.toBeInTheDocument();
	});

	it('opens with the heading, the lead and every point', async () => {
		const user = userEvent.setup();
		renderHelp();

		await user.click(screen.getByRole('button', { name: copy.label }));

		expect(screen.getByText(copy.title)).toBeInTheDocument();
		expect(screen.getByText(copy.body)).toBeInTheDocument();

		for (const point of Object.values(copy.points)) {
			expect(screen.getByText(point.title)).toBeInTheDocument();
			expect(screen.getByText(point.body)).toBeInTheDocument();
		}
	});
});
