'use client';

import { useEffect, useState } from 'react';
import type { DocHeading } from '@/lib/docs';
import { cn } from '@/lib/utils/cn';

export function DocsToc({ headings }: { headings: DocHeading[] }) {
	const [active, setActive] = useState('');

	useEffect(() => {
		const targets = headings
			.map((heading) => document.getElementById(heading.id))
			.filter((element): element is HTMLElement => element !== null);

		if (targets.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				const first = visible[0];
				if (first) setActive(first.target.id);
			},
			{ rootMargin: '-80px 0px -70% 0px', threshold: 0 }
		);

		for (const target of targets) observer.observe(target);
		return () => {
			observer.disconnect();
		};
	}, [headings]);

	if (headings.length === 0) return null;

	return (
		<nav aria-label="On this page" className="flex flex-col gap-2">
			<p className="font-mono text-overline text-text-subtle uppercase">On this page</p>
			<ul className="flex flex-col gap-1 border-l border-border">
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							href={`#${heading.id}`}
							aria-current={heading.id === active ? 'true' : undefined}
							className={cn(
								'-ml-px block border-l py-0.5 pl-3 text-body-sm no-underline transition-colors duration-120 ease-out hover:no-underline',
								heading.id === active
									? 'border-primary font-medium text-primary'
									: 'border-transparent text-text-muted hover:border-border-strong hover:text-text'
							)}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
