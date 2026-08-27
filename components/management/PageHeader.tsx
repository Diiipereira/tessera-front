import type { ReactNode } from 'react';

type PageHeaderProps = {
	title: string;
	description: string;
	action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
	return (
		<header className="flex flex-wrap items-start gap-4">
			<div className="min-w-60 flex-1">
				<h1 className="text-h1">{title}</h1>
				<p className="text-body text-pretty text-text-muted">{description}</p>
			</div>
			{action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
		</header>
	);
}
