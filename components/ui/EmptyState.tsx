import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type EmptyStateProps = {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
			<div className="grid size-16 place-items-center rounded-full bg-surface-sunken">
				<Icon className="size-10 text-text-subtle" strokeWidth={1.5} aria-hidden="true" />
			</div>
			<h3 className="mt-4 text-h4">{title}</h3>
			{description ? (
				<p className="mt-1 max-w-sm text-body-sm text-text-muted">{description}</p>
			) : null}
			{action ? <div className="mt-5">{action}</div> : null}
		</div>
	);
}
