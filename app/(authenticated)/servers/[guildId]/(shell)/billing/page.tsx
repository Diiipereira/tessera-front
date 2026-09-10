import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { mockBilling } from '@/lib/mock';
import { BillingScreen } from './BillingScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('billing');

	return { title: t('title') };
}

export default function Page() {
	return <BillingScreen billing={mockBilling} />;
}
