'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { useId } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

type SwitchProps = {
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
	description?: string;
	name?: string;
	id?: string;
	'aria-label'?: string;
	className?: string;
};

export function Switch({
	checked,
	defaultChecked,
	onCheckedChange,
	disabled,
	label,
	description,
	name,
	id,
	'aria-label': ariaLabel,
	className
}: SwitchProps) {
	const field = useFieldState();
	const uid = useId();

	const isDisabled = disabled ?? field?.disabled ?? false;
	const controlId = id ?? field?.controlId ?? uid;
	const descriptionId = description ? `${uid}-description` : undefined;

	return (
		<div className={cn('flex items-start gap-3', className)}>
			<SwitchPrimitive.Root
				checked={checked}
				defaultChecked={defaultChecked}
				onCheckedChange={onCheckedChange}
				disabled={isDisabled}
				name={name}
				id={controlId}
				aria-label={ariaLabel}
				aria-describedby={descriptionId ?? field?.describedBy}
				className="relative mt-0.5 box-border inline-flex h-5 w-9 shrink-0 rounded-full border-0 p-0.5 transition-colors duration-120 ease-out before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-[''] disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-off"
			>
				<SwitchPrimitive.Thumb className="pointer-events-none block size-4 rounded-full bg-white shadow-thumb transition-transform duration-120 ease-out data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
			</SwitchPrimitive.Root>

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
