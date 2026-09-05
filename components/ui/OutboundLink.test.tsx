import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { OutboundLink } from './OutboundLink';

describe('OutboundLink', () => {
	it('links out when there is somewhere to go', () => {
		render(<OutboundLink href="https://discord.gg/tessera">Support</OutboundLink>, {
			wrapper: Translated
		});

		expect(screen.getByRole('link', { name: 'Support' })).toHaveAttribute(
			'href',
			'https://discord.gg/tessera'
		);
	});

	it('is not a link at all when the address does not exist yet', () => {
		render(<OutboundLink href={null}>Support</OutboundLink>, { wrapper: Translated });

		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('says why it is dead, so it does not read as a working link', () => {
		render(<OutboundLink href={null}>Support</OutboundLink>, { wrapper: Translated });

		expect(screen.getByText(enUS.common.notAvailable, { exact: false })).toBeInTheDocument();
		expect(screen.getByText(/Support/)).toHaveAttribute('aria-disabled', 'true');
	});

	it('holds the hidden note inside itself, or sr-only escapes a clipped layout', () => {
		render(<OutboundLink href={null}>Support</OutboundLink>, { wrapper: Translated });

		expect(screen.getByText(/Support/)).toHaveClass('relative');
	});
});
