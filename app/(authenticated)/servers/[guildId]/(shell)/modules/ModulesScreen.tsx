'use client';

import { PackageSearch } from 'lucide-react';
import { useState } from 'react';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { BRAND } from '@/lib/brand';
import type { ModuleCategory, ModuleId, ModuleSummary } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

const CATEGORIES: (ModuleCategory | 'All')[] = [
	'All',
	'Engagement',
	'Safety',
	'Community',
	'Utility'
];

const segment = 'h-8 rounded-sm px-3 text-body-sm transition-colors duration-120 ease-out';

type ModulesScreenProps = {
	modules: ModuleSummary[];
	guildId: string;
	planIsPaid: boolean;
};

export function ModulesScreen({ modules, guildId, planIsPaid }: ModulesScreenProps) {
	const [items, setItems] = useState(modules);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<ModuleCategory | 'All'>('All');

	const term = query.trim().toLowerCase();
	const matches = items.filter((module) => {
		const inCategory = category === 'All' || module.category === category;
		const inSearch =
			term === '' ||
			module.name.toLowerCase().includes(term) ||
			module.description.toLowerCase().includes(term);
		return inCategory && inSearch;
	});

	function toggle(id: ModuleId, enabled: boolean) {
		setItems((current) =>
			current.map((module) =>
				module.id === id ? { ...module, status: enabled ? 'active' : 'off' } : module
			)
		);
	}

	const activeCount = items.filter((module) => module.status === 'active').length;

	return (
		<div className="w-full p-6 sm:p-8">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-h1">Modules</h1>
					<p className="text-body text-text-muted">
						{activeCount} of {items.length} running in this server. Turn one on here, then open it
						to configure.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<SearchInput
						value={query}
						onValueChange={setQuery}
						placeholder="Search modules…"
						aria-label="Search modules"
						className="max-w-80"
					/>

					<div
						role="group"
						aria-label="Filter by category"
						className="flex flex-wrap items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
					>
						{CATEGORIES.map((option) => (
							<button
								key={option}
								type="button"
								aria-pressed={category === option}
								className={cn(
									segment,
									category === option
										? 'bg-primary-subtle text-primary'
										: 'text-text-muted hover:text-text'
								)}
								onClick={() => {
									setCategory(option);
								}}
							>
								{option}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mt-8">
				{matches.length === 0 ? (
					<EmptyState
						icon={PackageSearch}
						title="No modules match"
						description={`Nothing in ${BRAND.name} answers to that. Try another word, or clear the category filter.`}
					/>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-5">
						{matches.map((module) => (
							<ModuleCard
								key={module.id}
								module={module}
								guildId={guildId}
								locked={module.premium && !planIsPaid}
								onToggle={toggle}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
