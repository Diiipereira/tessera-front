import type { ReactNode } from 'react';
import { DocsHeader } from '@/components/docs/DocsHeader';
import { DocsNavTree } from '@/components/docs/DocsNavTree';
import { PublicFooter } from '@/components/marketing/PublicFooter';
import { docNav, docSearchIndex } from '@/lib/docs';

export default function DocsLayout({ children }: { children: ReactNode }) {
	const groups = docNav();
	const entries = docSearchIndex();

	return (
		<div className="flex min-h-svh flex-col">
			<DocsHeader groups={groups} entries={entries} />

			<div className="flex flex-1 items-start">
				<aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-border px-4 py-8 lg:block">
					<DocsNavTree groups={groups} />
				</aside>

				<div className="min-w-0 flex-1">
					<div className="flex max-w-300 items-start gap-10 px-6 py-10 sm:px-10">{children}</div>
				</div>
			</div>

			<PublicFooter />
		</div>
	);
}
