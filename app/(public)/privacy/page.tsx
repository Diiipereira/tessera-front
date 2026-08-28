import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPage } from '../LegalPage';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('legal');

	return { title: t('privacy') };
}

export default function Page() {
	return <LegalPage document="privacy" />;
}
