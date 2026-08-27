import { cn } from '@/lib/utils/cn';

type MeterProps = {
	value: number;
	max?: number;
	label?: string;
	valueLabel?: string;
	className?: string;
};

export function Meter({ value, max = 100, label, valueLabel, className }: MeterProps) {
	const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
	const fill = percent >= 95 ? 'bg-danger' : percent >= 80 ? 'bg-warning' : 'bg-primary';
	const valueColor =
		percent >= 95 ? 'text-danger-fg' : percent >= 80 ? 'text-warning-fg' : 'text-text-muted';

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			{Boolean(label) || Boolean(valueLabel) ? (
				<div className="flex items-baseline justify-between gap-3">
					{label ? <span className="text-body-sm text-text">{label}</span> : null}
					{valueLabel ? (
						<span className={cn('tabular font-mono text-caption', valueColor)}>{valueLabel}</span>
					) : null}
				</div>
			) : null}
			<div
				role="meter"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
				aria-label={label}
				className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken"
			>
				<div
					className={cn('h-full rounded-full transition-[width] duration-220 ease-out', fill)}
					style={{ width: `${String(percent)}%` }}
				/>
			</div>
		</div>
	);
}
