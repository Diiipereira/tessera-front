import type { ReactNode } from 'react';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

export function ModulePageSkeleton({
	label,
	headerAction = false,
	headerActionSize = 'h-8 w-32',
	aside,
	children
}: {
	label: string;
	headerAction?: boolean;
	headerActionSize?: string;
	aside?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="w-full p-6 sm:p-8" aria-busy="true" aria-label={`Loading ${label}`}>
			<header className="flex flex-wrap items-start gap-4">
				<Skeleton className="size-10 shrink-0 rounded-lg" />

				<div className="min-w-60 flex-1">
					<TextSkeleton line="h1" width="w-52" />
					<TextSkeleton line="body" width="w-120 max-w-full" />
				</div>

				<div className="flex shrink-0 items-center gap-4">
					{headerAction ? (
						<Skeleton className={cn('shrink-0 rounded-md', headerActionSize)} />
					) : null}
					<TextSkeleton line="body-sm" width="w-12" />
					<Skeleton className="h-5 w-9 shrink-0 rounded-full" />
					<TextSkeleton line="body" width="w-16" />
				</div>
			</header>

			<div
				className={cn(
					'mt-6 gap-6',
					aside ? 'grid xl:grid-cols-[minmax(0,1fr)_440px]' : 'flex flex-col'
				)}
			>
				<div className="flex min-w-0 flex-col gap-6">{children}</div>
				{aside ? <div className="min-w-0">{aside}</div> : null}
			</div>
		</div>
	);
}

export function SectionSkeleton({
	description = true,
	action = false,
	actionSize = 'h-8 w-28',
	danger = false,
	children
}: {
	description?: boolean;
	action?: boolean;
	actionSize?: string;
	danger?: boolean;
	children: ReactNode;
}) {
	return (
		<section
			className={cn(
				'overflow-hidden rounded-lg border bg-surface shadow-1',
				danger ? 'border-danger' : 'border-border'
			)}
		>
			<header className="flex items-start gap-3 border-b border-border px-5 py-4">
				<div className="min-w-0 flex-1">
					<TextSkeleton line="h4" width="w-44" />
					{description ? (
						<TextSkeleton line="body-sm" width="w-96 max-w-full" className="mt-0.5" />
					) : null}
				</div>
				{action ? <Skeleton className={cn('shrink-0 rounded-md', actionSize)} /> : null}
			</header>

			<div className="flex flex-col gap-5 p-5">{children}</div>
		</section>
	);
}

export function FieldSkeleton({
	hint = false,
	width = 'w-full',
	control = 'h-9'
}: {
	hint?: boolean;
	width?: string;
	control?: string;
}) {
	return (
		<div className="flex flex-col">
			<TextSkeleton line="body-sm" width="w-28" className={hint ? 'mb-0.5' : 'mb-1.5'} />
			{hint ? <TextSkeleton line="caption" width="w-80 max-w-full" className="mb-1.5" /> : null}
			<Skeleton className={cn('rounded-md', control, width)} />
		</div>
	);
}

export function SwitchSkeleton({ description = true }: { description?: boolean }) {
	return (
		<div className="flex items-start gap-3">
			<Skeleton className="mt-0.5 h-5 w-9 shrink-0 rounded-full" />
			<div className="min-w-0 flex-1">
				<TextSkeleton line="body" width="w-64 max-w-full" />
				{description ? <TextSkeleton line="caption" width="w-96 max-w-full" /> : null}
			</div>
		</div>
	);
}

export function FieldRowSkeleton({ fields }: { fields: { width: string; help?: number }[] }) {
	return (
		<div className="flex flex-wrap items-start gap-4">
			{fields.map((field, index) => (
				<div key={`${field.width}-${String(index)}`} className={cn('flex flex-col', field.width)}>
					<TextSkeleton line="body-sm" className="mb-1.5" />
					<Skeleton className="h-9 w-full rounded-md" />
					{field.help === undefined ? null : (
						<div className="mt-1.5">
							{Array.from({ length: field.help }, (_, line) => (
								<TextSkeleton key={line} line="caption" width={line === 0 ? 'w-full' : 'w-2/3'} />
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export function ComposerSkeleton({ embed = false }: { embed?: boolean }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3">
				<Skeleton className="h-8.5 w-44 rounded-md" />
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				<TextSkeleton line="caption" width="w-12" />
				{['w-16', 'w-28', 'w-20', 'w-18', 'w-28', 'w-26', 'w-20', 'w-16', 'w-16', 'w-22'].map(
					(width, index) => (
						<Skeleton key={`${width}-${String(index)}`} className={cn('h-6 rounded-sm', width)} />
					)
				)}
			</div>

			{embed ? (
				<div className="flex flex-col gap-5">
					<FieldSkeleton />
					<div className="flex flex-col">
						<TextSkeleton line="body-sm" width="w-24" className="mb-1.5" />
						<Skeleton className="h-24 w-full rounded-md" />
						<TextSkeleton line="caption" width="w-16" className="mt-1.5 justify-end" />
					</div>
					<FieldSkeleton />
					<div className="flex flex-col gap-3">
						<div className="flex h-8 items-center gap-3">
							<TextSkeleton line="caption" width="w-16" />
							<Skeleton className="h-px flex-1" />
							<Skeleton className="h-8 w-28 rounded-md" />
						</div>
						{[0, 1].map((index) => (
							<div
								key={index}
								className="flex flex-col gap-2 rounded-md border border-border bg-surface-sunken p-3"
							>
								<Skeleton className="h-9 w-full rounded-md" />
								<Skeleton className="h-19 w-full rounded-md" />
								<SwitchSkeleton description={false} />
							</div>
						))}
					</div>
					<FieldSkeleton />
					<SwitchSkeleton />
				</div>
			) : (
				<div className="flex flex-col">
					<Skeleton className="h-28 w-full rounded-md" />
					<TextSkeleton line="caption" width="w-16" className="mt-1.5 justify-end" />
				</div>
			)}
		</div>
	);
}

export function LineSkeleton({ width = 'w-full' }: { width?: string }) {
	return <TextSkeleton line="body" width={width} />;
}

export function ListSkeleton({
	rows,
	rowHeight = 'h-11',
	divided = true
}: {
	rows: number;
	rowHeight?: string;
	divided?: boolean;
}) {
	return (
		<div className="flex flex-col">
			{Array.from({ length: rows }, (_, index) => (
				<div
					key={index}
					className={cn(
						'flex items-center gap-3 py-3 first:pt-0 last:pb-0',
						divided && 'border-b border-border last:border-0'
					)}
				>
					<Skeleton className={cn('flex-1', rowHeight)} />
				</div>
			))}
		</div>
	);
}
