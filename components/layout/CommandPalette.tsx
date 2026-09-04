'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { guildHref, navGroups, type GuildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';
import { Avatar } from './Avatar';

type Entry = {
	id: string;
	label: string;
	meta?: string;
	href: GuildHref;
	group: string;
	guild?: Guild;
	icon?: LucideIcon;
};

type CommandPaletteProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	guild: Guild;
	guilds: Guild[];
};

export function CommandPalette({ open, onOpenChange, guild, guilds }: CommandPaletteProps) {
	const t = useTranslations('palette');
	const nav = useTranslations('nav');
	const shared = useTranslations('common');
	const router = useRouter();
	const [query, setQuery] = useState('');
	const [cursor, setCursor] = useState(0);

	const entries = useMemo<Entry[]>(
		() => [
			...navGroups.flatMap((group) =>
				group.items.map((item) => ({
					id: `${group.id}:${item.id}`,
					label: nav(item.id),
					href: guildHref(guild.id, item.path),
					group: group.id === 'overview' ? nav('navigation') : nav(`groups.${group.id}`),
					icon: item.icon
				}))
			),
			...guilds
				.filter((entry) => entry.id !== guild.id)
				.map((entry) => ({
					id: `guild:${entry.id}`,
					label: entry.name,
					meta: entry.hasBot ? t('switchServer') : t('addServer', { name: entry.name }),
					href: guildHref(entry.id, ''),
					group: t('servers'),
					guild: entry
				}))
		],
		[guild.id, guilds, nav, t]
	);

	const matches = useMemo(
		() => entries.filter((entry) => entry.label.toLowerCase().includes(query.trim().toLowerCase())),
		[entries, query]
	);

	const sections = useMemo(
		() =>
			matches.reduce<{ label: string; items: Entry[] }[]>((groups, entry) => {
				const last = groups.at(-1);
				if (last?.label === entry.group) last.items.push(entry);
				else groups.push({ label: entry.group, items: [entry] });
				return groups;
			}, []),
		[matches]
	);

	const [wasOpen, setWasOpen] = useState(open);
	if (open !== wasOpen) {
		setWasOpen(open);
		if (!open) {
			setQuery('');
			setCursor(0);
		}
	}

	const [lastQuery, setLastQuery] = useState(query);
	if (query !== lastQuery) {
		setLastQuery(query);
		setCursor(0);
	}

	useEffect(() => {
		function handle(event: globalThis.KeyboardEvent) {
			if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
			event.preventDefault();
			onOpenChange(!open);
		}
		window.addEventListener('keydown', handle);
		return () => {
			window.removeEventListener('keydown', handle);
		};
	}, [open, onOpenChange]);

	const select = useCallback(
		(entry: Entry | undefined) => {
			if (!entry) return;
			onOpenChange(false);
			router.push(entry.href);
		},
		[onOpenChange, router]
	);

	function handleKeydown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setCursor((current) => (matches.length === 0 ? 0 : (current + 1) % matches.length));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setCursor((current) =>
				matches.length === 0 ? 0 : (current - 1 + matches.length) % matches.length
			);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			select(matches[cursor]);
		}
	}

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop" />
				<DialogPrimitive.Content className="fixed inset-x-6 top-24 z-50 mx-auto flex max-w-160 flex-col overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-3 data-[state=open]:animate-pop">
					<DialogPrimitive.Title className="sr-only">{t('title')}</DialogPrimitive.Title>

					<div className="flex items-center gap-3 border-b border-border px-5 py-4">
						<Search className="size-5 shrink-0 text-text-subtle" aria-hidden="true" />
						<input
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
							}}
							onKeyDown={handleKeydown}
							type="text"
							placeholder={t('placeholder')}
							aria-label={shared('search')}
							role="combobox"
							aria-expanded="true"
							aria-controls="palette-results"
							className="min-w-0 flex-1 bg-transparent text-body-lg text-text outline-none"
						/>
						<span className="rounded-sm border border-border px-1.5 py-0.5 font-mono text-caption font-normal text-text-muted">
							{t('escapeKey')}
						</span>
					</div>

					<div id="palette-results" role="listbox" className="max-h-105 overflow-y-auto p-2">
						{sections.length === 0 ? (
							<p className="px-2 py-6 text-center text-body-sm text-text-muted">
								{t('empty', { query })}
							</p>
						) : (
							sections.map((section) => (
								<div key={section.label} className="contents">
									<div className="px-2 pt-3 pb-1 first:pt-1">
										<span className="font-mono text-overline text-text-muted uppercase">
											{section.label}
										</span>
									</div>
									{section.items.map((entry) => {
										const index = matches.indexOf(entry);
										const selected = index === cursor;
										const Icon = entry.icon;
										return (
											<button
												key={entry.id}
												type="button"
												role="option"
												aria-selected={selected}
												className={cn(
													'flex h-10 w-full items-center gap-3 rounded-sm px-2 text-left transition-colors duration-120 ease-out',
													selected
														? 'bg-surface-hover text-text'
														: 'text-text-muted hover:bg-surface-hover'
												)}
												onMouseMove={() => {
													setCursor(index);
												}}
												onClick={() => {
													select(entry);
												}}
											>
												{entry.guild ? (
													<Avatar
														initials={entry.guild.initials}
														color={entry.guild.color}
														size="sm"
													/>
												) : null}
												{!entry.guild && Icon ? (
													<Icon
														className={cn('size-4 shrink-0', selected && 'text-primary')}
														aria-hidden="true"
													/>
												) : null}
												<span className="min-w-0 flex-1 truncate text-body">{entry.label}</span>
												{entry.meta === undefined ? null : (
													<span className="shrink-0 truncate text-caption font-normal text-text-muted">
														{entry.meta}
													</span>
												)}
											</button>
										);
									})}
								</div>
							))
						)}
					</div>

					<div className="flex flex-wrap items-center gap-4 border-t border-border bg-surface-sunken px-5 py-2.5 text-caption font-normal text-text-muted">
						<span>
							<span className="font-mono">&uarr;&darr;</span> {t('navigate')}
						</span>
						<span>
							<span className="font-mono">&crarr;</span> {t('select')}
						</span>
						<span>
							<span className="font-mono">{t('escapeKey')}</span> {t('dismiss')}
						</span>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
