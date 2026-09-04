import type { MDXContent } from 'mdx/types';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ALL_DOC_SLUGS } from '@/content/docs/nav';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { findDocPage } from '@/lib/docs/content';
import { toLocale } from '@/lib/locale';

type DocsPageProps = {
	params: Promise<{ slug: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = false;

export function generateStaticParams() {
	return ALL_DOC_SLUGS.filter((slug) => slug !== '').map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
	const [{ slug }, locale] = await Promise.all([params, getLocale()]);
	const page = await findDocPage(toLocale(locale), slug.join('/'));

	if (page === undefined) return { title: 'Not found' };

	return { title: page.title, description: page.summary };
}

export default async function Page({ params, searchParams }: DocsPageProps) {
	const [{ slug }, query, raw] = await Promise.all([params, searchParams, getLocale()]);
	const locale = toLocale(raw);
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
