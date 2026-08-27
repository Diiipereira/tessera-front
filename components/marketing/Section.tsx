import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SectionProps = {
	id?: string;
	subtle?: boolean;
	narrow?: boolean;
	className?: string;
	children: ReactNode;
};

export function Section({ id, subtle = false, narrow = false, className, children }: SectionProps) {
	return (
		<section
			id={id}
			className={cn('scroll-mt-22 border-b border-border', subtle && 'bg-bg-subtle')}
		>
			<div
				className={cn('mx-auto px-6 py-20 sm:px-8', narrow ? 'max-w-200' : 'max-w-300', className)}
			>
				{children}
			</div>
		</section>
	);
}

type SectionIntroProps = {
	overline?: string;
	title: string;
	lead?: string;
	className?: string;
};

export function SectionIntro({ overline, title, lead, className }: SectionIntroProps) {
	return (
		<div className={cn('max-w-[60ch]', className)}>
			{overline ? (
				<p className="mb-3 font-mono text-overline text-text-muted uppercase">{overline}</p>
			) : null}
			<h2 className="text-h1 text-pretty">{title}</h2>
			{lead ? <p className="mt-3 text-body-lg text-pretty text-text-muted">{lead}</p> : null}
		</div>
	);
}
