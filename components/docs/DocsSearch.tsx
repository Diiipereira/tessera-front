'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { searchDocs, type DocSearchEntry } from '@/lib/docs';
import { docsHref } from '@/lib/docs/types';
import { cn } from '@/lib/utils/cn';

export function DocsSearch({ entries }: { entries: DocSearchEntry[] }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [aim, setAim] = useState({ query: '', index: 0 });

	const matches = useMemo(() => searchDocs(entries, query), [entries, query]);
	const cursor = aim.query === query ? aim.index : 0;

	function moveCursor(index: number) {
		setAim({ query, index });
	}

	useEffect(() => {
		function handle(event: globalThis.KeyboardEvent) {
			if (event.key !== 'k' || !(event.metaKey || event.ctrlKey)) return;
			event.preventDefault();
			setOpen((current) => !current);
		}
		window.addEventListener('keydown', handle);
		return () => {
			window.removeEventListener('keydown', handle);
		};
	}, []);

	const select = useCallback(
		(entry: DocSearchEntry | undefined) => {
			if (!entry) return;
			setOpen(false);
			setQuery('');
			router.push(docsHref(entry.slug));
		},
		[router]
	);

	function handleKeydown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveCursor(matches.length === 0 ? 0 : (cursor + 1) % matches.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveCursor(matches.length === 0 ? 0 : (cursor - 1 + matches.length) % matches.length);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			select(matches[cursor]);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setOpen(true);
				}}
				aria-label="Search the documentation"
				className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-left text-body text-text-muted transition-colors duration-120 ease-out hover:border-border-strong hover:text-text sm:w-full sm:justify-start sm:gap-2 sm:px-3"
			>
				<Search className="size-4 shrink-0" aria-hidden="true" />
				<span className="hidden min-w-0 flex-1 truncate sm:block">Search docs…</span>
				<span className="hidden shrink-0 rounded-sm border border-border px-1.5 py-0.5 font-mono text-caption font-normal md:block">
					Ctrl K
				</span>
			</button>

			<DialogPrimitive.Root open={open} onOpenChange={setOpen}>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop" />
					<DialogPrimitive.Content className="fixed inset-x-6 top-24 z-50 mx-auto flex max-w-160 flex-col overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-3 data-[state=open]:animate-pop">
						<DialogPrimitive.Title className="sr-only">
							Search the documentation
						</DialogPrimitive.Title>

						<div className="flex items-center gap-3 border-b border-border px-5 py-4">
							<Search className="size-5 shrink-0 text-text-subtle" aria-hidden="true" />
							<input
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
								}}
								onKeyDown={handleKeydown}
								type="text"
								placeholder="Search every page…"
								aria-label="Search the documentation"
								role="combobox"
								aria-expanded="true"
								aria-controls="docs-search-results"
								className="min-w-0 flex-1 bg-transparent text-body-lg text-text outline-none"
							/>
							<span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-caption font-normal text-text-muted">
								esc
							</span>
						</div>

						<div id="docs-search-results" role="listbox" className="max-h-105 overflow-y-auto p-2">
							{query.trim() === '' ? (
								<p className="px-2 py-6 text-center text-body-sm text-text-muted">
									Type to search {entries.length} pages.
								</p>
							) : matches.length === 0 ? (
								<p className="px-2 py-6 text-center text-body-sm text-text-muted">
									Nothing matches &ldquo;{query}&rdquo;.
								</p>
							) : (
								matches.map((entry, index) => {
									const selected = index === cursor;

									return (
										<button
											key={entry.slug}
											type="button"
											role="option"
											aria-selected={selected}
											onMouseMove={() => {
												moveCursor(index);
											}}
											onClick={() => {
												select(entry);
											}}
											className={cn(
												'flex w-full flex-col gap-0.5 rounded-sm px-3 py-2 text-left transition-colors duration-120 ease-out',
												selected
													? 'bg-surface-hover shadow-[inset_2px_0_0_var(--primary)]'
													: 'hover:bg-surface-hover'
											)}
										>
											<span className="flex items-baseline gap-2">
												<span
													className={cn(
														'min-w-0 truncate text-body font-medium',
														selected ? 'text-primary' : 'text-text'
													)}
												>
													{entry.title}
												</span>
												<span className="shrink-0 font-mono text-caption font-normal text-text-subtle">
													{entry.group}
												</span>
											</span>
											<span className="line-clamp-1 text-body-sm text-text-muted">
												{entry.summary}
											</span>
										</button>
									);
								})
							)}
						</div>
					</DialogPrimitive.Content>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		</>
	);
}
