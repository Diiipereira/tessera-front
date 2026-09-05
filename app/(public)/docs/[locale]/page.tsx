import type { MDXContent } from 'mdx/types';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs/content';
import { docsAlternates, docsLocaleParams } from '@/lib/docs/route';
import { localeOfDocsSegment } from '@/lib/locale';

type DocsIndexProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = false;

export const generateStaticParams = docsLocaleParams;

export async function generateMetadata({ params }: DocsIndexProps): Promise<Metadata> {
	const locale = localeOfDocsSegment((await params).locale);

	if (locale === undefined) return { title: 'Not found' };

	const t = await getTranslations({ locale, namespace: 'docs' });

	return { title: t('title'), alternates: docsAlternates(locale, '') };
}

export default async function Page({ params, searchParams }: DocsIndexProps) {
	const [{ locale: segment }, query] = await Promise.all([params, searchParams]);
	const locale = localeOfDocsSegment(segment);

	if (locale === undefined) notFound();

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
