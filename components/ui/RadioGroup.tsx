'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { useId } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

export type RadioOption = {
	value: string;
	label: string;
	description?: string;
	disabled?: boolean;
};

type RadioGroupProps = {
	options: RadioOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	name?: string;
	className?: string;
};

export function RadioGroup({
	options,
	value,
	defaultValue,
	onValueChange,
	disabled,
	name,
	className
}: RadioGroupProps) {
	const field = useFieldState();
	const uid = useId();
	const isDisabled = disabled ?? field?.disabled ?? false;

	return (
		<RadioGroupPrimitive.Root
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			disabled={isDisabled}
			name={name}
			aria-describedby={field?.describedBy}
			className={cn('flex flex-col gap-3', className)}
		>
			{options.map((option) => {
				const optionId = `${uid}-${option.value}`;
				const descriptionId = option.description ? `${optionId}-description` : undefined;

				return (
					<div key={option.value} className="flex items-start gap-2">
						<RadioGroupPrimitive.Item
							id={optionId}
							value={option.value}
							disabled={option.disabled}
							aria-describedby={descriptionId}
							className="mt-0.75 grid size-4 shrink-0 place-items-center rounded-full border border-border-strong transition-colors duration-120 ease-out disabled:cursor-not-allowed disabled:opacity-45 data-[state=checked]:border-primary"
						>
							<RadioGroupPrimitive.Indicator className="block size-1.5 rounded-full bg-primary" />
						</RadioGroupPrimitive.Item>

						<div className="min-w-0">
							<label
								htmlFor={optionId}
								className={cn(
									'block cursor-pointer text-body',
									(option.disabled ?? false) || isDisabled
										? 'cursor-not-allowed text-text-subtle'
										: 'text-text'
								)}
							>
								{option.label}
							</label>
							{option.description ? (
								<p id={descriptionId} className="text-caption font-normal text-text-muted">
									{option.description}
								</p>
							) : null}
						</div>
					</div>
				);
			})}
		</RadioGroupPrimitive.Root>
	);
}
