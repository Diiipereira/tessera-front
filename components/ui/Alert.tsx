import { CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const wrappers: Record<AlertVariant, string> = {
	info: 'border-info bg-info-subtle',
	success: 'border-success bg-success-subtle',
	warning: 'border-warning bg-warning-subtle',
	danger: 'border-danger bg-danger-subtle'
};

const icons: Record<AlertVariant, LucideIcon> = {
	info: Info,
	success: CircleCheck,
	warning: TriangleAlert,
	danger: TriangleAlert
};

const iconColors: Record<AlertVariant, string> = {
	info: 'text-info',
	success: 'text-success',
	warning: 'text-warning',
	danger: 'text-danger'
};

const bodyColors: Record<AlertVariant, string> = {
	info: 'text-info-fg',
	success: 'text-success-fg',
	warning: 'text-warning-fg',
	danger: 'text-danger-fg'
};

type AlertProps = {
	variant?: AlertVariant;
	title: string;
	action?: ReactNode;
	className?: string;
	children?: ReactNode;
};

export function Alert({ variant = 'info', title, action, className, children }: AlertProps) {
	const Icon = icons[variant];

	return (
		<div
			role="alert"
			className={cn('flex gap-3 rounded-lg border p-4', wrappers[variant], className)}
		>
			<Icon className={cn('mt-0.5 size-5 shrink-0', iconColors[variant])} aria-hidden="true" />
			<div className={cn('min-w-0 flex-1', bodyColors[variant])}>
				<p className="font-semibold">{title}</p>
				{children ? <div className="mt-1 text-body-sm">{children}</div> : null}
				{action ? <div className="mt-3">{action}</div> : null}
			</div>
		</div>
	);
}
