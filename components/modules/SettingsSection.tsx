import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SettingsSectionProps = {
	title: string;
	description?: string;
	action?: ReactNode;
	danger?: boolean;
	className?: string;
	children: ReactNode;
};

export function SettingsSection({
	title,
	description,
	action,
	danger = false,
	className,
	children
}: SettingsSectionProps) {
	return (
		<section
			className={cn(
				'overflow-hidden rounded-lg border bg-surface shadow-1',
				danger ? 'border-danger' : 'border-border',
				className
			)}
		>
			<header className="flex items-start gap-3 border-b border-border px-5 py-4">
				<div className="min-w-0 flex-1">
					<h2 className={cn('text-h4', danger && 'text-danger')}>{title}</h2>
					{description ? (
						<p className="mt-0.5 text-body-sm text-pretty text-text-muted">{description}</p>
					) : null}
				</div>
				{action ? <div className="shrink-0">{action}</div> : null}
			</header>

			<div className="flex flex-col gap-5 p-5">{children}</div>
		</section>
	);
}
