'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { fieldIconButton } from './field-icon-button';
import { Input } from './Input';

type SearchInputProps = Omit<
	ComponentPropsWithRef<'input'>,
	'value' | 'defaultValue' | 'onChange' | 'type'
> & {
	value: string;
	onValueChange: (value: string) => void;
};

export function SearchInput({ value, onValueChange, ...rest }: SearchInputProps) {
	const t = useTranslations('pickers');
	const ref = useRef<HTMLInputElement>(null);

	function clear() {
		onValueChange('');
		ref.current?.focus();
	}

	return (
		<Input
			{...rest}
			ref={ref}
			type="search"
			value={value}
			onChange={(event) => {
				onValueChange(event.target.value);
			}}
			onKeyDown={(event) => {
				if (event.key === 'Escape' && value !== '') {
					event.preventDefault();
					clear();
				}
				rest.onKeyDown?.(event);
			}}
			leading={<Search aria-hidden="true" />}
			trailing={
				<button
					type="button"
					aria-label={t('clearSearch')}
					onClick={clear}
					className={cn(fieldIconButton, value === '' && 'invisible')}
				>
					<X aria-hidden="true" />
				</button>
			}
		/>
	);
}
