'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

export type CheckedState = boolean | 'indeterminate';

type CheckboxProps = {
	checked?: CheckedState;
	defaultChecked?: CheckedState;
	onCheckedChange?: (checked: CheckedState) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
	name?: string;
	id?: string;
	className?: string;
};

export function Checkbox({
	checked,
	defaultChecked,
	onCheckedChange,
	disabled,
	label,
	description,
	name,
	id,
	className
}: CheckboxProps) {
	const field = useFieldState();
	const uid = useId();

	const isDisabled = disabled ?? field?.disabled ?? false;
	const controlId = id ?? field?.controlId ?? uid;
	const descriptionId = description ? `${uid}-description` : undefined;

	return (
		<div className={cn('flex items-start gap-2', className)}>
			<CheckboxPrimitive.Root
				checked={checked}
				defaultChecked={defaultChecked}
				onCheckedChange={onCheckedChange}
				disabled={isDisabled}
				name={name}
				id={controlId}
				aria-describedby={descriptionId ?? field?.describedBy}
				className="group relative mt-0.75 grid size-4 shrink-0 place-items-center rounded-xs border border-border-strong bg-transparent text-primary-fg transition-colors duration-120 ease-out before:absolute before:-inset-1 before:content-[''] disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary"
			>
				<CheckboxPrimitive.Indicator className="grid place-items-center">
					<Check
						className="size-3 group-data-[state=indeterminate]:hidden"
						strokeWidth={3}
						aria-hidden="true"
					/>
					<Minus
						className="hidden size-3.5 group-data-[state=indeterminate]:block"
						strokeWidth={2.5}
						aria-hidden="true"
					/>
				</CheckboxPrimitive.Indicator>
			</CheckboxPrimitive.Root>

			{Boolean(label) || Boolean(description) ? (
				<div className="min-w-0">
					{label ? (
						<label
							htmlFor={controlId}
							className={cn(
								'block cursor-pointer text-body',
								isDisabled ? 'cursor-not-allowed text-text-subtle' : 'text-text'
							)}
						>
							{label}
						</label>
					) : null}
					{description ? (
						<p id={descriptionId} className="text-caption font-normal text-text-muted">
							{description}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
