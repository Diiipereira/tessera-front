import type { MDXContent } from 'mdx/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_DOC_SLUGS } from '@/content/docs/nav';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs/content';
import { docsAlternates, docsLocaleParams } from '@/lib/docs/route';
import { localeOfDocsSegment } from '@/lib/locale';

type DocsPageProps = {
	params: Promise<{ locale: string; slug: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = false;

export function generateStaticParams() {
	return docsLocaleParams().flatMap(({ locale }) =>
		ALL_DOC_SLUGS.filter((slug) => slug !== '').map((slug) => ({ locale, slug: slug.split('/') }))
	);
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
	const { locale: segment, slug } = await params;
	const locale = localeOfDocsSegment(segment);

	if (locale === undefined) return { title: 'Not found' };

	const path = slug.join('/');
	const page = await findDocPage(locale, path);

	if (page === undefined) return { title: 'Not found' };

	return {
		title: page.title,
		description: page.summary,
		alternates: docsAlternates(locale, path)
	};
}

export default async function Page({ params, searchParams }: DocsPageProps) {
	const [{ locale: segment, slug }, query] = await Promise.all([params, searchParams]);
	const locale = localeOfDocsSegment(segment);

	if (locale === undefined) notFound();

	const path = slug.join('/');
	const page = await findDocPage(locale, path);

	if (page === undefined) notFound();
	if (query.state === 'loading') return <DocsSkeleton />;

	const { default: Body } = (await import(`@/content/docs/${locale}/${path}.mdx`)) as {
		default: MDXContent;
	};

	return (
		<DocsArticle locale={locale} page={page}>
			<Body />
		</DocsArticle>
	);
}
