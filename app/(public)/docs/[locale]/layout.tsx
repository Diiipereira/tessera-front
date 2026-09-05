import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { DocsHeader } from '@/components/docs/DocsHeader';
import { DocsNavTree } from '@/components/docs/DocsNavTree';
import { PublicFooter } from '@/components/marketing/PublicFooter';
import { docNav, docSearchIndex } from '@/lib/docs/content';
import { localeOfDocsSegment } from '@/lib/locale';

export default async function DocsLayout({
	children,
	params
}: {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const locale = localeOfDocsSegment((await params).locale);

	if (locale === undefined) notFound();

	const [groups, entries] = await Promise.all([docNav(locale), docSearchIndex(locale)]);

	return (
		<div className="flex min-h-svh flex-col lg:h-svh lg:min-h-0 lg:overflow-hidden">
			<DocsHeader groups={groups} entries={entries} />

			<div className="flex flex-1 lg:min-h-0">
				<aside className="hidden w-72 shrink-0 thin-scroll overflow-y-auto border-r border-border px-4 py-8 lg:block">
					<DocsNavTree groups={groups} />
				</aside>

				<div className="flex min-w-0 flex-1 thin-scroll flex-col lg:min-h-0 lg:overflow-y-auto">
					<div className="mx-auto flex w-full max-w-300 flex-1 items-start gap-10 px-6 py-10 sm:px-10">
						{children}
					</div>

					<PublicFooter />
				</div>
			</div>
		</div>
	);
}
