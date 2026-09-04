import type { ReactNode } from 'react';

export function Step({ title, children }: { title: string; children?: ReactNode }) {
	return (
		<li className="flex gap-3 [counter-increment:doc-step]">
			<span
				aria-hidden="true"
				className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-mono text-caption text-primary before:content-[counter(doc-step)]"
			/>
			<div className="min-w-0 flex-1">
				<p className="text-body font-semibold text-text">{title}</p>
				<div className="mt-0.5 flex flex-col gap-2">{children}</div>
			</div>
		</li>
	);
}

export function Steps({ children }: { children?: ReactNode }) {
	return <ol className="flex list-none flex-col gap-4 [counter-reset:doc-step]">{children}</ol>;
}
