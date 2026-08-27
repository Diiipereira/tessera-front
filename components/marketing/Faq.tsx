'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { FAQ_ENTRIES } from '@/lib/marketing';
import { cn } from '@/lib/utils/cn';
import { Section } from './Section';

export function Faq() {
	const [openId, setOpenId] = useState<string | null>(FAQ_ENTRIES[0]?.id ?? null);

	return (
		<Section id="faq" subtle narrow>
			<h2 className="mb-8 text-h1 text-pretty">Common questions</h2>

			<div className="flex flex-col gap-2">
				{FAQ_ENTRIES.map((entry) => {
					const open = openId === entry.id;
					return (
						<div
							key={entry.id}
							className="overflow-hidden rounded-lg border border-border bg-surface"
						>
							<h3>
								<button
									type="button"
									aria-expanded={open}
									aria-controls={`faq-${entry.id}`}
									className="flex w-full items-center gap-4 px-5 py-4 text-left text-body-lg font-medium transition-colors duration-120 ease-out hover:bg-surface-hover"
									onClick={() => {
										setOpenId(open ? null : entry.id);
									}}
								>
									<span className="min-w-0 flex-1 text-pretty">{entry.question}</span>
									<ChevronDown
										aria-hidden="true"
										className={cn(
											'size-4.5 shrink-0 text-text-subtle transition-transform duration-150 ease-overlay',
											open && 'rotate-180'
										)}
									/>
								</button>
							</h3>
							{open ? (
								<p
									id={`faq-${entry.id}`}
									className="px-5 pb-5 text-body text-pretty text-text-muted"
								>
									{entry.answer}
								</p>
							) : null}
						</div>
					);
				})}
			</div>
		</Section>
	);
}
