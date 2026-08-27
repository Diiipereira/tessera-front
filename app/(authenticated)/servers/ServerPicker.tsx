'use client';

import { RefreshCw, ServerOff } from 'lucide-react';
import { useState } from 'react';
import { GuildCard } from '@/components/discord/GuildCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { BRAND } from '@/lib/brand';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';

type Filter = 'all' | 'managed' | 'available';

const filters: { id: Filter; label: string }[] = [
	{ id: 'all', label: 'All' },
	{ id: 'managed', label: `With ${BRAND.name}` },
	{ id: 'available', label: 'Available' }
];

const segment = 'h-8 rounded-sm px-3 text-body-sm transition-colors duration-120 ease-out';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-5';

const SKELETON_CARDS = [0, 1, 2, 3, 4, 5];

function Section({ title, guilds }: { title: string; guilds: Guild[] }) {
	if (guilds.length === 0) return null;

	return (
		<section className="flex flex-col gap-4">
			<h2 className="font-mono text-overline text-text-muted uppercase">{title}</h2>
			<div className={GRID}>
				{guilds.map((guild) => (
					<GuildCard key={guild.id} guild={guild} />
				))}
			</div>
		</section>
	);
}

type ServerPickerProps = {
	guilds: Guild[];
	loading: boolean;
	empty: boolean;
};

export function ServerPicker({ guilds, loading, empty }: ServerPickerProps) {
	const [query, setQuery] = useState('');
	const [filter, setFilter] = useState<Filter>('all');

	const source = empty ? [] : guilds;
	const matches = source.filter((guild) =>
		guild.name.toLowerCase().includes(query.trim().toLowerCase())
	);

	const managed = filter === 'available' ? [] : matches.filter((guild) => guild.hasBot);
	const available = filter === 'managed' ? [] : matches.filter((guild) => !guild.hasBot);
	const nothingToShow = managed.length === 0 && available.length === 0;

	return (
		<div className="flex min-h-svh w-full flex-col gap-8 px-6 py-10 sm:px-8">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-h1">Your servers</h1>
					<p className="text-body text-text-muted">
						Pick a server to configure, or add {BRAND.name} to one you manage.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<SearchInput
						value={query}
						onValueChange={setQuery}
						placeholder="Search servers…"
						aria-label="Search servers"
						className="max-w-80"
					/>

					<div
						role="group"
						aria-label="Filter servers"
						className="flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
					>
						{filters.map((option) => (
							<button
								key={option.id}
								type="button"
								aria-pressed={filter === option.id}
								className={cn(
									segment,
									filter === option.id
										? 'bg-primary-subtle text-primary'
										: 'text-text-muted hover:text-text'
								)}
								onClick={() => {
									setFilter(option.id);
								}}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{loading ? (
				<div className={GRID}>
					{SKELETON_CARDS.map((index) => (
						<div
							key={index}
							className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5"
						>
							<Skeleton className="size-16 shrink-0 rounded-lg" />
							<div className="flex min-w-0 flex-1 flex-col gap-2">
								<Skeleton className="h-5 w-2/3" />
								<Skeleton className="h-3.5 w-1/3" />
								<Skeleton className="mt-1 h-8 w-24 rounded-md" />
							</div>
						</div>
					))}
				</div>
			) : nothingToShow ? (
				<EmptyState
					icon={ServerOff}
					title="No servers found"
					description={`You need Manage Server permission on a Discord server to configure ${BRAND.name}.`}
					action={
						<Button
							variant="outline"
							onClick={() => {
								location.reload();
							}}
						>
							<RefreshCw aria-hidden="true" />
							Recheck permissions
						</Button>
					}
				/>
			) : (
				<>
					<Section title={`Managed by ${BRAND.name}`} guilds={managed} />
					<Section title={`Add ${BRAND.name}`} guilds={available} />
				</>
			)}
		</div>
	);
}
