'use client';

import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Popover } from '@/components/ui/Popover';
import { guildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';
import { Avatar } from './Avatar';

type GuildSwitcherProps = {
	guild: Guild;
	guilds: Guild[];
	collapsible?: boolean;
	className?: string;
	onNavigate?: () => void;
};

export function GuildSwitcher({
	guild,
	guilds,
	collapsible = false,
	className,
	onNavigate
}: GuildSwitcherProps) {
	const t = useTranslations('shell');
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');

	const matches = guilds.filter((entry) =>
		entry.name.toLowerCase().includes(query.trim().toLowerCase())
	);

	function pick() {
		setOpen(false);
		setQuery('');
		onNavigate?.();
	}

	const trigger = (
		<>
			<Avatar initials={guild.initials} color={guild.color} />
			<span className={cn('min-w-0 flex-1 text-left', collapsible && 'sidebar-collapsed:hidden')}>
				<span className="block truncate text-body font-medium">{guild.name}</span>
				<span className="tabular block text-caption font-normal text-text-muted">
					{t('members', { count: formatCount(guild.memberCount) })}
				</span>
			</span>
			<ChevronsUpDown
				className={cn(
					'size-4 shrink-0 text-text-subtle',
					collapsible && 'sidebar-collapsed:hidden'
				)}
				aria-hidden="true"
			/>
		</>
	);

	return (
		<div className={cn('shrink-0', className)}>
			<Popover
				open={open}
				onOpenChange={setOpen}
				align="start"
				className="w-65 max-w-none overflow-hidden p-0"
				triggerClassName={cn(
					'flex w-full items-center gap-2.5 rounded-md p-1.5 text-text transition-colors duration-120 ease-out hover:bg-surface-hover',
					collapsible &&
						'sidebar-collapsed:mx-auto sidebar-collapsed:size-10 sidebar-collapsed:justify-center sidebar-collapsed:p-0'
				)}
				trigger={trigger}
			>
				<div className="flex h-10 items-center gap-2 border-b border-border px-3">
					<Search className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
					<input
						value={query}
						onChange={(event) => {
							setQuery(event.target.value);
						}}
						type="text"
						placeholder={t('searchServersPlaceholder')}
						aria-label={t('searchServers')}
						className="min-w-0 flex-1 bg-transparent text-body-sm text-text outline-none"
					/>
				</div>

				<div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto p-1.5">
					{matches.length === 0 ? (
						<p className="px-2 py-3 text-body-sm text-text-muted">{t('noServers', { query })}</p>
					) : (
						matches.map((entry) => (
							<Link
								key={entry.id}
								href={guildHref(entry.id, '')}
								onClick={pick}
								className={cn(
									'flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-body-sm text-text no-underline transition-colors duration-120 ease-out hover:bg-surface-hover hover:no-underline',
									entry.id === guild.id && 'bg-primary-subtle'
								)}
							>
								<Avatar initials={entry.initials} color={entry.color} size="sm" />
								<span className="min-w-0 flex-1 truncate">{entry.name}</span>
								{entry.id === guild.id ? (
									<Check className="size-4 shrink-0 text-primary" aria-label={t('currentServer')} />
								) : null}
							</Link>
						))
					)}
				</div>

				<div className="border-t border-border p-1.5">
					<Link
						href="/servers"
						onClick={pick}
						className="flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-body-sm text-text-muted no-underline transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text hover:no-underline"
					>
						<Plus className="size-4 shrink-0" aria-hidden="true" />
						{t('addServer')}
					</Link>
				</div>
			</Popover>
		</div>
	);
}
