import type { Metadata } from 'next';
import { LandingScreen } from '@/components/marketing/LandingScreen';
import { loginErrorFor } from '@/lib/auth';

export const metadata: Metadata = { title: 'Sign in' };

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const errorParam = typeof params.error === 'string' ? params.error : null;

	return <LandingScreen error={loginErrorFor(errorParam)} signInFirst />;
}
