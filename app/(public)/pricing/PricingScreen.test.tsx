import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Translated } from '@/tests/i18n';
import { PLANS, findPlan, formatPrice, monthlyEquivalentCents } from '@/lib/billing';
import { PricingScreen } from './PricingScreen';

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn() }),
	usePathname: () => '/pricing'
}));

const pro = findPlan('pro');

function renderPricing() {
	return render(
		<Translated>
			<ThemeProvider>
				<PricingScreen />
			</ThemeProvider>
		</Translated>
	);
}

describe('PricingScreen', () => {
	it('prices every tier from lib/billing, not from copy', () => {
		renderPricing();

		for (const plan of PLANS) {
			expect(
				screen.getByText(formatPrice(monthlyEquivalentCents(plan, 'monthly')), {
					selector: 'p'
				})
			).toBeInTheDocument();
		}
	});

	it('switches to the yearly equivalent and says what is actually billed', async () => {
		const user = userEvent.setup();
		renderPricing();

		await user.click(screen.getByRole('button', { name: 'Yearly' }));

		expect(
			screen.getByText(formatPrice(monthlyEquivalentCents(pro, 'yearly')), { selector: 'p' })
		).toBeInTheDocument();
		expect(
			screen.getByText(`per month, billed ${formatPrice(pro.yearlyCents)} yearly`)
		).toBeInTheDocument();
	});

	it('reads a zero quota as not included rather than as the number 0', () => {
		renderPricing();

		const row = screen.getByRole('row', { name: /Scheduled messages/ });
		expect(row).toHaveTextContent('Not included');
		expect(row).toHaveTextContent('Unlimited');
	});
});
