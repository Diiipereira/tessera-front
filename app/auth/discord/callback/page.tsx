import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { callbackFailureFor } from '@/lib/auth';
import { CallbackScreen } from './CallbackScreen';

const FALLBACK_REFERENCE = '8f21c04e';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('auth');

	return { title: t('connecting') };
}

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const errorParam = typeof params.error === 'string' ? params.error : null;
	const refParam = typeof params.ref === 'string' ? params.ref : FALLBACK_REFERENCE;

	return <CallbackScreen failure={callbackFailureFor(errorParam, refParam)} />;
}
