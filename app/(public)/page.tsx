import type { Metadata } from 'next';
import { LandingScreen } from '@/components/marketing/LandingScreen';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
	title: { absolute: `${BRAND.name} — ${BRAND.tagline}` }
};

export default function Page() {
	return <LandingScreen />;
}
