'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

type InputProps = Omit<ComponentPropsWithRef<'input'>, 'className'> & {
	leading?: ReactNode;
	trailing?: ReactNode;
	invalid?: boolean;
	className?: string;
};

const base =
	'h-9 w-full rounded-md border bg-surface px-3 text-body text-text transition-colors duration-120 ease-out placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle disabled:opacity-45';

export function Input({
	leading,
	trailing,
	invalid,
	className,
	id,
	disabled,
	readOnly,
	...rest
}: InputProps) {
	const field = useFieldState();
	const isInvalid = invalid ?? field?.invalid ?? false;
	const isDisabled = disabled ?? field?.disabled ?? false;

	const stateClasses = isInvalid
		? 'border-danger focus:border-danger'
		: readOnly
			? 'cursor-default border-border bg-surface-sunken'
			: 'border-border hover:border-border-strong focus:border-primary';

	const input = (
		<input
			{...rest}
			id={id ?? field?.controlId}
			disabled={isDisabled}
			readOnly={readOnly}
			aria-invalid={isInvalid || undefined}
			aria-describedby={field?.describedBy}
			className={cn(base, stateClasses, leading && 'pl-9', trailing && 'pr-9', className)}
		/>
	);

	if (!leading && !trailing) return input;

	return (
		<div className="relative flex items-center">
			{leading ? (
				<span className="pointer-events-none absolute left-3 flex items-center text-text-muted [&_svg]:size-4">
					{leading}
				</span>
			) : null}
			{input}
			{trailing ? (
				<span className="pointer-events-none absolute right-3 flex items-center text-caption text-text-muted [&_button]:pointer-events-auto [&_svg]:size-4">
					{trailing}
				</span>
			) : null}
		</div>
	);
}
