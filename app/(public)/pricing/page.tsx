import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PricingScreen } from './PricingScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('pricing');

	return { title: t('overline') };
}

export default function Page() {
	return <PricingScreen />;
}
