import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('docs');

	return { title: t('title') };
}

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const query = await searchParams;
	const page = findDocPage('');
	if (!page) notFound();
	if (query.state === 'loading') return <DocsSkeleton />;

	return <DocsArticle page={page} />;
}
