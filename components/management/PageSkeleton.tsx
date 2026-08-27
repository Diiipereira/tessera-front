import type { ReactNode } from 'react';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

export function ManagementPageSkeleton({
	label,
	titleWidth = 'w-48',
	descriptionWidth = 'w-140',
	action = false,
	actionSize = 'h-9 w-44',
	children
}: {
	label: string;
	titleWidth?: string;
	descriptionWidth?: string;
	action?: boolean;
	actionSize?: string;
	children: ReactNode;
}) {
	return (
		<div className="w-full p-6 sm:p-8" aria-busy="true" aria-label={`Loading ${label}`}>
			<header className="flex flex-wrap items-start gap-4">
				<div className="min-w-60 flex-1">
					<TextSkeleton line="h1" width={titleWidth} />
					<TextSkeleton line="body" width={cn(descriptionWidth, 'max-w-full')} />
				</div>
				{action ? <Skeleton className={cn('shrink-0 rounded-md', actionSize)} /> : null}
			</header>

			{children}
		</div>
	);
}

export function PanelSkeleton({
	children,
	className
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'overflow-hidden rounded-lg border border-border bg-surface shadow-1',
				className
			)}
		>
			{children}
		</div>
	);
}

export function TableSkeleton({
	minWidth = 'min-w-200',
	head,
	children,
	className
}: {
	minWidth?: string;
	head: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<PanelSkeleton className={className}>
			<div className="overflow-x-auto">
				<div className={cn('flex flex-col', minWidth)}>
					<div className="flex items-center border-b border-border">{head}</div>
					{children}
				</div>
			</div>
		</PanelSkeleton>
	);
}

export function TableRowSkeleton({ children }: { children: ReactNode }) {
	return <div className="flex border-b border-border last:border-0">{children}</div>;
}
