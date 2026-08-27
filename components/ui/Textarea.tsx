'use client';

import { useState, type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

type TextareaProps = Omit<ComponentPropsWithRef<'textarea'>, 'className'> & {
	invalid?: boolean;
	showCount?: boolean;
	className?: string;
};

const base =
	'min-h-24 w-full resize-y rounded-md border bg-surface px-3 py-2.5 text-body text-text transition-colors duration-120 ease-out placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle disabled:opacity-45';

export function Textarea({
	invalid,
	showCount = false,
	className,
	id,
	disabled,
	maxLength,
	value,
	defaultValue,
	onChange,
	...rest
}: TextareaProps) {
	const field = useFieldState();
	const [internal, setInternal] = useState(String(defaultValue ?? ''));

	const isInvalid = invalid ?? field?.invalid ?? false;
	const isDisabled = disabled ?? field?.disabled ?? false;

	const text = value === undefined ? internal : String(value);
	const count = text.length;
	const overLimit = maxLength !== undefined && count > maxLength;

	const stateClasses = isInvalid
		? 'border-danger focus:border-danger'
		: 'border-border hover:border-border-strong focus:border-primary';

	return (
		<>
			<textarea
				{...rest}
				id={id ?? field?.controlId}
				maxLength={maxLength}
				disabled={isDisabled}
				value={value}
				defaultValue={defaultValue}
				onChange={(event) => {
					if (value === undefined) setInternal(event.target.value);
					onChange?.(event);
				}}
				aria-invalid={isInvalid || undefined}
				aria-describedby={field?.describedBy}
				className={cn(base, stateClasses, className)}
			/>
			{showCount && maxLength !== undefined ? (
				<div
					className={cn(
						'mt-1.5 text-right font-mono text-caption',
						overLimit ? 'text-danger' : 'text-text-muted'
					)}
				>
					{count} / {maxLength}
				</div>
			) : null}
		</>
	);
}
