'use client';

import { Calendar, CalendarClock, Clock } from 'lucide-react';
import { useRef, type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { fieldIconButton } from './field-icon-button';
import { Input } from './Input';
import { useFieldState } from './field-context';

type DateTimeKind = 'time' | 'date' | 'datetime-local';

type DateTimeInputProps = Omit<
	ComponentPropsWithRef<'input'>,
	'value' | 'defaultValue' | 'onChange' | 'type'
> & {
	type: DateTimeKind;
	value: string;
	onValueChange: (value: string) => void;
};

const ICONS = { time: Clock, date: Calendar, 'datetime-local': CalendarClock };

const LABELS = {
	time: 'Open the time picker',
	date: 'Open the date picker',
	'datetime-local': 'Open the date and time picker'
};

export function DateTimeInput({
	type,
	value,
	onValueChange,
	disabled,
	...rest
}: DateTimeInputProps) {
	const ref = useRef<HTMLInputElement>(null);
	const field = useFieldState();
	const isDisabled = disabled ?? field?.disabled ?? false;
	const Icon = ICONS[type];

	return (
		<Input
			{...rest}
			ref={ref}
			type={type}
			value={value}
			disabled={isDisabled}
			onChange={(event) => {
				onValueChange(event.target.value);
			}}
			trailing={
				<button
					type="button"
					aria-label={LABELS[type]}
					onClick={() => {
						ref.current?.showPicker();
					}}
					className={cn(fieldIconButton, isDisabled && 'invisible')}
				>
					<Icon aria-hidden="true" />
				</button>
			}
		/>
	);
}
