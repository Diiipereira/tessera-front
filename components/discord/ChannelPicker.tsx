'use client';

import {
	Check,
	ChevronsUpDown,
	Hash,
	Lock,
	Megaphone,
	MessagesSquare,
	Search,
	Volume2,
	type LucideIcon
} from 'lucide-react';
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
	forum: MessagesSquare
};

const row =
	'flex h-8 w-full items-center gap-2 rounded-sm px-2 text-body transition-colors duration-120 ease-out';

type ChannelPickerProps = {
	channels: Channel[];
	value?: string | null;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	id?: string;
};

export function ChannelPicker({
	channels,
	value = null,
	onValueChange,
	placeholder = 'Pick a channel…',
	id
}: ChannelPickerProps) {
	const field = useFieldState();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	const selected = channels.find((channel) => channel.id === value);

	const matches = channels.filter((channel) => channel.name.includes(query.trim().toLowerCase()));

	const groups = matches.reduce<{ category: string; items: Channel[] }[]>((acc, channel) => {
		const last = acc.at(-1);
		if (last?.category === channel.category) last.items.push(channel);
		else acc.push({ category: channel.category, items: [channel] });
		return acc;
	}, []);

	function pick(channel: Channel) {
		if (channel.lockedReason) return;
		onValueChange?.(channel.id);
		setOpen(false);
		setQuery('');
	}

	const trigger = (
		<>
			<Hash className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
			<span
				id={id ?? field?.controlId}
				className={cn('min-w-0 flex-1 truncate text-left', !selected && 'text-text-muted')}
			>
				{selected ? `#${selected.name}` : placeholder}
			</span>
			<ChevronsUpDown className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
		</>
	);

	function optionButton(channel: Channel): ReactElement {
		const Icon = ICONS[channel.kind];
		return (
			<button
				type="button"
				aria-disabled={channel.lockedReason ? true : undefined}
				className={cn(
					row,
					channel.lockedReason
						? 'cursor-not-allowed text-text-muted opacity-50'
						: channel.id === value
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
				) : channel.id === value ? (
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
					placeholder="Search channels…"
					aria-label="Search channels"
					className="min-w-0 flex-1 bg-transparent text-body text-text outline-none"
				/>
			</div>

			<div className="max-h-70 thin-scroll overflow-y-auto overscroll-contain p-1">
				{groups.length === 0 ? (
					<p className="px-2 py-3 text-body-sm text-text-muted">
						No channel matches &ldquo;{query}&rdquo;.
					</p>
				) : (
					groups.map((group) => (
						<div key={group.category} className="contents">
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
