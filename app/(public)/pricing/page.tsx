import type { Metadata } from 'next';
import { PricingScreen } from './PricingScreen';

export const metadata: Metadata = { title: 'Pricing' };

export default function Page() {
	return <PricingScreen />;
}
