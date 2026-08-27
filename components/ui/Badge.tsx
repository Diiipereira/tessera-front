import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant =
	'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';

const variants: Record<BadgeVariant, string> = {
	neutral: 'bg-surface-sunken text-text-muted',
	primary: 'bg-primary-subtle text-primary-subtle-fg',
	success: 'bg-success-subtle text-success-fg',
	warning: 'bg-warning-subtle text-warning-fg',
	danger: 'bg-danger-subtle text-danger-fg',
	info: 'bg-info-subtle text-info-fg',
	outline: 'border border-border bg-transparent text-text-muted'
};

const dots: Record<BadgeVariant, string> = {
	neutral: 'bg-text-subtle',
	primary: 'bg-primary',
	success: 'bg-success',
	warning: 'bg-warning',
	danger: 'bg-danger',
	info: 'bg-info',
	outline: 'bg-text-subtle'
};

type BadgeProps = {
	variant?: BadgeVariant;
	dot?: boolean;
	className?: string;
	children: ReactNode;
};

export function Badge({ variant = 'neutral', dot = false, className, children }: BadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex h-5 items-center gap-1.5 rounded-sm px-2 text-caption whitespace-nowrap',
				variants[variant],
				className
			)}
		>
			{dot ? (
				<span className={cn('size-1.5 shrink-0 rounded-full', dots[variant])} aria-hidden="true" />
			) : null}
			{children}
		</span>
	);
}
