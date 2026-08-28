import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingScreen } from '@/components/marketing/LandingScreen';
import { loginErrorFor } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('auth');

	return { title: t('signIn') };
}

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const errorParam = typeof params.error === 'string' ? params.error : null;

	return <LandingScreen error={loginErrorFor(errorParam)} signInFirst />;
}
