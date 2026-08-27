'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Input } from './Input';
import { useFieldState } from './field-context';

type NumberInputProps = Omit<
	ComponentPropsWithRef<'input'>,
	'value' | 'defaultValue' | 'onChange' | 'type' | 'className'
> & {
	value: number;
	onValueChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	leading?: ReactNode;
	className?: string;
};

const stepButton =
	'flex h-1/2 w-full justify-center text-text-subtle transition-colors duration-120 ease-out hover:text-text disabled:pointer-events-none disabled:opacity-30';

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

export function NumberInput({
	value,
	onValueChange,
	min = 0,
	max = Number.MAX_SAFE_INTEGER,
	step = 1,
	leading,
	className,
	disabled,
	...rest
}: NumberInputProps) {
	const field = useFieldState();
	const [text, setText] = useState(String(value));

	const [lastValue, setLastValue] = useState(value);
	if (value !== lastValue) {
		setLastValue(value);
		if (Number(text) !== value) setText(String(value));
	}

	const isDisabled = disabled ?? field?.disabled ?? false;

	function nudge(delta: number) {
		const next = clamp(value + delta, min, max);
		setText(String(next));
		onValueChange(next);
	}

	return (
		<div className={cn('relative', className)}>
			<Input
				{...rest}
				type="number"
				inputMode="numeric"
				min={min}
				max={max}
				value={text}
				leading={leading}
				disabled={isDisabled}
				className="pr-8"
				onChange={(event) => {
					const next = event.target.value;
					setText(next);
					if (next === '') return;
					const parsed = Number(next);
					if (Number.isFinite(parsed)) onValueChange(clamp(parsed, min, max));
				}}
				onBlur={(event) => {
					const parsed = Number(event.target.value);
					const settled = Number.isFinite(parsed) && event.target.value !== '' ? parsed : value;
					const clamped = clamp(settled, min, max);
					setText(String(clamped));
					onValueChange(clamped);
					rest.onBlur?.(event);
				}}
			/>

			<div
				aria-hidden="true"
				className={cn('absolute inset-y-0 right-1.75 flex w-7 flex-col', isDisabled && 'hidden')}
			>
				<button
					type="button"
					tabIndex={-1}
					disabled={value >= max}
					className={cn(stepButton, 'items-end')}
					onClick={() => {
						nudge(step);
					}}
				>
					<ChevronUp className="-mb-1 size-4" />
				</button>
				<button
					type="button"
					tabIndex={-1}
					disabled={value <= min}
					className={cn(stepButton, 'items-start')}
					onClick={() => {
						nudge(-step);
					}}
				>
					<ChevronDown className="-mt-1 size-4" />
				</button>
			</div>
		</div>
	);
}
