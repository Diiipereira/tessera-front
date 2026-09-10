'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';

export type SelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type SelectProps = {
	options: SelectOption[];
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	invalid?: boolean;
	name?: string;
	className?: string;
};

export function Select({
	options,
	value,
	defaultValue,
	onValueChange,
	placeholder,
	disabled,
	invalid,
	name,
	className
}: SelectProps) {
	const t = useTranslations('common');
	const field = useFieldState();

	const isInvalid = invalid ?? field?.invalid ?? false;
	const isDisabled = disabled ?? field?.disabled ?? false;

	const triggerState = isInvalid
		? 'border-danger'
		: 'border-border hover:border-border-strong focus-visible:border-primary data-[state=open]:border-primary';

	return (
		<SelectPrimitive.Root
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			disabled={isDisabled}
			name={name}
		>
			<SelectPrimitive.Trigger
				id={field?.controlId}
				aria-invalid={isInvalid || undefined}
				aria-describedby={field?.describedBy}
				className={cn(
					'flex h-9 w-full items-center gap-2 rounded-md border bg-surface px-3 text-left text-body text-text transition-colors duration-120 ease-out focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle disabled:opacity-45 data-placeholder:text-text-subtle',
					triggerState,
					className
				)}
			>
				<span className="min-w-0 flex-1 truncate">
					<SelectPrimitive.Value placeholder={placeholder ?? t('select')} />
				</span>
				<SelectPrimitive.Icon asChild>
					<ChevronsUpDown className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>

			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={4}
					collisionPadding={12}
					className="z-60 flex max-h-[min(20rem,var(--radix-select-content-available-height,20rem))] w-(--radix-select-trigger-width) flex-col overflow-hidden rounded-lg border border-border-strong bg-surface-raised p-1 shadow-2 data-[state=open]:animate-pop"
				>
					<SelectPrimitive.ScrollUpButton className="flex h-5 shrink-0 cursor-default items-center justify-center rounded-sm text-text-subtle hover:bg-surface-hover hover:text-text">
						<ChevronUp className="size-3.5" aria-hidden="true" />
					</SelectPrimitive.ScrollUpButton>

					<SelectPrimitive.Viewport className="min-h-0 overscroll-contain">
						{options.map((option) => (
							<SelectPrimitive.Item
								key={option.value}
								value={option.value}
								disabled={option.disabled}
								className="group relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-body text-text transition-colors duration-120 ease-out outline-none select-none data-disabled:cursor-not-allowed data-disabled:opacity-45 data-highlighted:bg-surface-hover"
							>
								<span
									className="absolute inset-y-1 left-0 hidden w-0.5 rounded-full bg-primary group-data-highlighted:block"
									aria-hidden="true"
								/>
								<SelectPrimitive.ItemText>
									<span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
								</SelectPrimitive.ItemText>
								<SelectPrimitive.ItemIndicator className="ml-auto">
									<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
								</SelectPrimitive.ItemIndicator>
							</SelectPrimitive.Item>
						))}
					</SelectPrimitive.Viewport>

					<SelectPrimitive.ScrollDownButton className="flex h-5 shrink-0 cursor-default items-center justify-center rounded-sm text-text-subtle hover:bg-surface-hover hover:text-text">
						<ChevronDown className="size-3.5" aria-hidden="true" />
					</SelectPrimitive.ScrollDownButton>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
}
