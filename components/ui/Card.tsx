import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type CardProps = {
	title?: string;
	description?: string;
	header?: ReactNode;
	action?: ReactNode;
	footer?: ReactNode;
	danger?: boolean;
	padded?: boolean;
	className?: string;
	children: ReactNode;
};

export function Card({
	title,
	description,
	header,
	action,
	footer,
	danger = false,
	padded = true,
	className,
	children
}: CardProps) {
	const hasHeader = Boolean(title) || Boolean(description) || Boolean(header);

	return (
		<section
			className={cn(
				'overflow-hidden rounded-lg border bg-surface shadow-1',
				danger ? 'border-danger' : 'border-border',
				className
			)}
		>
			{hasHeader ? (
				<header className="flex items-start gap-3 border-b border-border px-5 py-4">
					<div className="min-w-0 flex-1">
						{header ?? (
							<>
								{title ? <h3 className={cn('text-h4', danger && 'text-danger')}>{title}</h3> : null}
								{description ? (
									<p className="mt-0.5 text-body-sm text-text-muted">{description}</p>
								) : null}
							</>
						)}
					</div>
					{action ? <div className="shrink-0">{action}</div> : null}
				</header>
			) : null}

			<div className={cn(padded && 'p-5')}>{children}</div>

			{footer ? (
				<footer className="border-t border-border bg-surface-sunken px-5 py-4">{footer}</footer>
			) : null}
		</section>
	);
}
