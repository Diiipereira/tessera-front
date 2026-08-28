import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingScreen } from '@/components/marketing/LandingScreen';
import { BRAND } from '@/lib/brand';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('brand');

	return { title: { absolute: `${BRAND.name} — ${t('tagline')}` } };
}

export default function Page() {
	return <LandingScreen />;
}
