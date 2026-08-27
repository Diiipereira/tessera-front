import { cn } from '@/lib/utils/cn';

const lineBox = {
	h1: 'h-9',
	h2: 'h-8',
	h3: 'h-7',
	h4: 'h-6',
	'body-lg': 'h-6.5',
	body: 'h-5.5',
	'body-sm': 'h-5',
	caption: 'h-4',
	overline: 'h-3.5'
};

const lineBar = {
	h1: 'h-7',
	h2: 'h-6',
	h3: 'h-5',
	h4: 'h-4',
	'body-lg': 'h-4',
	body: 'h-3.5',
	'body-sm': 'h-3',
	caption: 'h-3',
	overline: 'h-2.5'
};

export function Skeleton({ className }: { className?: string }) {
	return <div aria-hidden="true" className={cn('animate-pulse rounded-sm bg-border', className)} />;
}

export function TextSkeleton({
	line,
	width = 'w-full',
	className
}: {
	line: keyof typeof lineBox;
	width?: string;
	className?: string;
}) {
	return (
		<div className={cn('flex shrink-0 items-center', lineBox[line], className)}>
			<Skeleton className={cn(lineBar[line], width)} />
		</div>
	);
}
