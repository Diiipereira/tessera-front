import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LogoutScreen } from './LogoutScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('auth');

	return { title: t('signingOut') };
}

export default function Page() {
	return <LogoutScreen />;
}
