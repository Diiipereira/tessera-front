import type { MDXContent } from 'mdx/types';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs/content';
import { toLocale } from '@/lib/locale';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('docs');

	return { title: t('title') };
}

export default async function Page({
	searchParams
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const [query, raw] = await Promise.all([searchParams, getLocale()]);
	const locale = toLocale(raw);
	const page = await findDocPage(locale, '');

	if (page === undefined) notFound();
	if (query.state === 'loading') return <DocsSkeleton />;

	const { default: Body } = (await import(`@/content/docs/${locale}/index.mdx`)) as {
		default: MDXContent;
	};

	return (
		<DocsArticle locale={locale} page={page}>
			<Body />
		</DocsArticle>
	);
}
