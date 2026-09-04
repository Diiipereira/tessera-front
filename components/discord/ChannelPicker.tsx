'use client';

import {
	Check,
	ChevronsUpDown,
	Folder,
	Hash,
	Lock,
	Megaphone,
	MessagesSquare,
	Search,
	Volume2,
	type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactElement } from 'react';
import { Popover } from '@/components/ui/Popover';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFieldState } from '@/components/ui/field-context';
import type { Channel, ChannelKind } from '@/lib/types/discord';
import { cn } from '@/lib/utils/cn';

const ICONS: Record<ChannelKind, LucideIcon> = {
	text: Hash,
	voice: Volume2,
	announcement: Megaphone,
	forum: MessagesSquare,
	category: Folder
};

const SPOKEN_IN: readonly ChannelKind[] = ['text', 'voice', 'announcement', 'forum'];

const row =
	'flex h-8 w-full items-center gap-2 rounded-sm px-2 text-body transition-colors duration-120 ease-out';

const UNCATEGORISED_GROUP = 'uncategorised';

type SharedProps = {
	channels: Channel[];
	kinds?: readonly ChannelKind[];
	placeholder?: string;
	id?: string;
};

type SingleProps = SharedProps & {
	multiple?: false;
	value?: string | null;
	onValueChange?: (value: string) => void;
};

type MultipleProps = SharedProps & {
	multiple: true;
	value?: string[];
	onValueChange?: (value: string[]) => void;
};

type ChannelPickerProps = SingleProps | MultipleProps;

export function ChannelPicker(props: ChannelPickerProps) {
	const { channels, kinds, placeholder, id } = props;
	const t = useTranslations('pickers');
	const field = useFieldState();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	const chosen =
		props.multiple === true ? (props.value ?? []) : props.value == null ? [] : [props.value];

	const offered = channels.filter((channel) => (kinds ?? SPOKEN_IN).includes(channel.kind));

	const selected = offered.filter((channel) => chosen.includes(channel.id));

	const matches = offered.filter((channel) => channel.name.includes(query.trim().toLowerCase()));

	const groups = matches.reduce<{ id: string; category: string; items: Channel[] }[]>(
		(acc, channel) => {
			const id = channel.categoryId ?? UNCATEGORISED_GROUP;
			const group = acc.find((entry) => entry.id === id);

			if (group) group.items.push(channel);
			else acc.push({ id, category: channel.category, items: [channel] });

			return acc;
		},
		[]
	);

	function pick(channel: Channel) {
		if (channel.lockedReason) return;

		if (props.multiple === true) {
			props.onValueChange?.(
				chosen.includes(channel.id)
					? chosen.filter((entry) => entry !== channel.id)
					: [...chosen, channel.id]
			);
			return;
		}

		props.onValueChange?.(channel.id);
		setOpen(false);
		setQuery('');
	}

	const label = (
		<span
			id={id ?? field?.controlId}
			className={cn(
				'min-w-0 flex-1 truncate text-left',
				selected.length === 0 && 'text-text-muted'
			)}
		>
			{selected[0] === undefined
				? (placeholder ?? t('channel'))
				: `#${selected.map((channel) => channel.name).join(' #')}`}
		</span>
	);

	const trigger = (
		<>
			<Hash className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
			{label}
			<ChevronsUpDown className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
		</>
	);

	function optionButton(channel: Channel): ReactElement {
		const Icon = ICONS[channel.kind];
		const isSelected = chosen.includes(channel.id);

		return (
			<button
				type="button"
				aria-pressed={props.multiple === true ? isSelected : undefined}
				aria-disabled={channel.lockedReason ? true : undefined}
				className={cn(
					row,
					channel.lockedReason
						? 'cursor-not-allowed text-text-muted opacity-50'
						: isSelected
							? 'bg-primary-subtle text-text'
							: 'text-text hover:bg-surface-hover'
				)}
				onClick={() => {
					pick(channel);
				}}
			>
				<Icon className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
				<span className="min-w-0 flex-1 truncate text-left">{channel.name}</span>
				{channel.lockedReason ? (
					<Lock className="size-3.5 shrink-0 text-warning" aria-hidden="true" />
				) : isSelected ? (
					<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
				) : null}
			</button>
		);
	}

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			modal
			align="start"
			className="w-(--radix-popover-trigger-width) max-w-none overflow-hidden p-0"
			triggerClassName="flex h-9 w-full items-center gap-2 rounded-md border border-border bg-surface px-3 text-body text-text transition-colors duration-120 ease-out focus-visible:border-primary focus-visible:outline-none hover:border-border-strong data-[state=open]:border-primary"
			trigger={trigger}
		>
			<div className="flex items-center gap-2 border-b border-border px-3 py-2">
				<Search className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
				<input
					value={query}
					onChange={(event) => {
						setQuery(event.target.value);
					}}
					type="text"
					placeholder={t('searchChannels')}
					aria-label={t('searchChannelsLabel')}
					className="min-w-0 flex-1 bg-transparent text-body text-text outline-none"
				/>
			</div>

			<div className="max-h-70 thin-scroll overflow-y-auto overscroll-contain p-1">
				{groups.length === 0 ? (
					<p className="px-2 py-3 text-body-sm text-text-muted">{t('noChannelMatch', { query })}</p>
				) : (
					groups.map((group) => (
						<div key={group.id} className="contents">
							<div className="px-2 pt-3 pb-1 first:pt-1">
								<span className="font-mono text-overline text-text-muted uppercase">
									{group.category}
								</span>
							</div>
							{group.items.map((channel) =>
								channel.lockedReason ? (
									<Tooltip key={channel.id} content={channel.lockedReason} side="right" asChild>
										{optionButton(channel)}
									</Tooltip>
								) : (
									<div key={channel.id} className="contents">
										{optionButton(channel)}
									</div>
								)
							)}
						</div>
					))
				)}
			</div>
		</Popover>
	);
}
