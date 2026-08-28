'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';
import { useFieldState } from './field-context';
import { Popover } from './Popover';
import { SearchInput } from './SearchInput';

export type ComboboxOption = {
	value: string;
	label: string;
	search?: string;
};

type ComboboxProps = {
	options: ComboboxOption[];
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyLabel?: string;
	disabled?: boolean;
	invalid?: boolean;
	className?: string;
};

const searchTextOf = (option: ComboboxOption): string =>
	option.search ?? option.label.toLowerCase();

export function Combobox({
	options,
	value,
	onValueChange,
	placeholder,
	searchPlaceholder,
	emptyLabel,
	disabled,
	invalid,
	className
}: ComboboxProps) {
	const t = useTranslations('pickers');
	const shared = useTranslations('common');
	const field = useFieldState();
	const listId = useId();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [active, setActive] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);

	const isInvalid = invalid ?? field?.invalid ?? false;
	const isDisabled = disabled ?? field?.disabled ?? false;

	const selected = options.find((option) => option.value === value);

	const matches = useMemo(() => {
		const needle = query.trim().toLowerCase();

		if (needle === '') return options;

		return options.filter((option) => searchTextOf(option).includes(needle));
	}, [options, query]);

	useEffect(() => {
		listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
	}, [active]);

	function openChanged(next: boolean) {
		setOpen(next);
		setQuery('');

		if (!next) return;

		const index = options.findIndex((option) => option.value === value);

		setActive(index === -1 ? 0 : index);
	}

	function changeQuery(next: string) {
		setQuery(next);
		setActive(0);
	}

	function choose(next: string) {
		onValueChange(next);
		setOpen(false);
		setQuery('');
	}

	function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();

			const step = event.key === 'ArrowDown' ? 1 : -1;

			setActive((current) => {
				if (matches.length === 0) return 0;

				return (current + step + matches.length) % matches.length;
			});

			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();

			const option = matches[active];

			if (option !== undefined) choose(option.value);
		}
	}

	return (
		<Popover
			open={open}
			onOpenChange={openChanged}
			triggerAsChild
			className="w-(--radix-popover-trigger-width) max-w-none p-2"
			trigger={
				<button
					type="button"
					id={field?.controlId}
					role="combobox"
					aria-expanded={open}
					aria-controls={listId}
					aria-invalid={isInvalid || undefined}
					aria-describedby={field?.describedBy}
					disabled={isDisabled}
					className={cn(
						'flex h-9 w-full items-center gap-2 rounded-md border bg-surface px-3 text-left text-body text-text transition-colors duration-120 ease-out focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-subtle disabled:opacity-45',
						isInvalid
							? 'border-danger'
							: 'border-border hover:border-border-strong focus-visible:border-primary aria-expanded:border-primary',
						className
					)}
				>
					<span className={cn('min-w-0 flex-1 truncate', value === '' && 'text-text-subtle')}>
						{selected?.label ?? (value === '' ? (placeholder ?? shared('select')) : value)}
					</span>
					<ChevronsUpDown className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
				</button>
			}
		>
			<SearchInput
				value={query}
				onValueChange={changeQuery}
				onKeyDown={onKeyDown}
				placeholder={searchPlaceholder ?? shared('search')}
				aria-label={searchPlaceholder ?? shared('search')}
			/>

			{matches.length === 0 ? (
				<p className="px-2 py-6 text-center text-body-sm text-text-muted">
					{emptyLabel ?? t('nothingMatches')}
				</p>
			) : (
				<div
					ref={listRef}
					id={listId}
					role="listbox"
					className="mt-2 max-h-72 thin-scroll overflow-y-auto overscroll-contain"
				>
					{matches.map((option, index) => (
						<button
							key={option.value}
							type="button"
							role="option"
							aria-selected={option.value === value}
							onClick={() => {
								choose(option.value);
							}}
							onPointerMove={() => {
								setActive(index);
							}}
							className={cn(
								'flex h-8 w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-body text-text outline-none',
								index === active && 'bg-surface-hover'
							)}
						>
							<span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
							{option.value === value ? (
								<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
							) : null}
						</button>
					))}
				</div>
			)}
		</Popover>
	);
}
