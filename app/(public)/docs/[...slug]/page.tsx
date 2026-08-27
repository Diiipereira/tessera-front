import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocsArticle } from '@/components/docs/DocsArticle';
import { DocsSkeleton } from '@/components/skeletons/DocsSkeleton';
import { ALL_DOC_PAGES, findDocPage } from '@/lib/docs';

type DocsPageProps = {
	params: Promise<{ slug: string[] }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamicParams = false;

export function generateStaticParams() {
	return ALL_DOC_PAGES.filter((page) => page.slug !== '').map((page) => ({
		slug: page.slug.split('/')
	}));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = findDocPage(slug.join('/'));
	if (!page) return { title: 'Not found' };

	return { title: page.title, description: page.summary };
}

export default async function Page({ params, searchParams }: DocsPageProps) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const page = findDocPage(slug.join('/'));
	if (!page) notFound();
	if (query.state === 'loading') return <DocsSkeleton />;

	return <DocsArticle page={page} />;
}
