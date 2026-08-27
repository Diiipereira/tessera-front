import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs';

export const metadata: Metadata = { title: 'Documentation' };

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
