import type { Metadata } from 'next';
import { callbackFailureFor } from '@/lib/auth';
import { CallbackScreen } from './CallbackScreen';

export const metadata: Metadata = { title: 'Connecting' };

const FALLBACK_REFERENCE = '8f21c04e';

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
