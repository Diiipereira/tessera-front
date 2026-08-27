'use client';

import { cn } from '@/lib/utils/cn';

export type SegmentOption<T extends string> = {
	value: T;
	label: string;
	count?: number;
};

type SegmentedControlProps<T extends string> = {
	options: SegmentOption<T>[];
	value: T;
	onValueChange: (value: T) => void;
	label: string;
	size?: 'sm' | 'md';
	className?: string;
};

const sizes = {
	sm: 'h-7 rounded-sm px-2.5 text-caption',
	md: 'h-8 rounded-sm px-3 text-body-sm'
};

export function SegmentedControl<T extends string>({
	options,
	value,
	onValueChange,
	label,
	size = 'md',
	className
}: SegmentedControlProps<T>) {
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(
				'flex flex-wrap items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5',
				className
			)}
		>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					aria-pressed={value === option.value}
					className={cn(
						'transition-colors duration-120 ease-out',
						sizes[size],
						value === option.value
							? 'bg-primary-subtle text-primary'
							: 'text-text-muted hover:text-text'
					)}
					onClick={() => {
						onValueChange(option.value);
					}}
				>
					{option.label}
					{option.count === undefined ? null : (
						<span className="tabular ml-1.5 text-text-muted">{option.count}</span>
					)}
				</button>
			))}
		</div>
	);
}
