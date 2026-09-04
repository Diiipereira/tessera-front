'use client';

import { PackageSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { BRAND } from '@/lib/brand';
import { statusOf } from '@/lib/modules/catalog';
import { patchModule } from '@/lib/module-client';
import {
	MODULE_CATEGORIES,
	type ModuleCategory,
	type ModuleId,
	type ModuleSummary
} from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

const CATEGORIES: (ModuleCategory | 'all')[] = ['all', ...MODULE_CATEGORIES];

const segment = 'h-8 rounded-sm px-3 text-body-sm transition-colors duration-120 ease-out';

type ModulesScreenProps = {
	modules: ModuleSummary[];
	guildId: string;
};

export function ModulesScreen({ modules, guildId }: ModulesScreenProps) {
	const t = useTranslations('modulesList');
	const catalog = useTranslations('catalog');
	const names = useTranslations('nav');
	const [items, setItems] = useState(modules);
	const [saving, setSaving] = useState<ModuleId | null>(null);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<ModuleCategory | 'all'>('all');

	const term = query.trim().toLowerCase();
	const matches = items.filter((module) => {
		const inCategory = category === 'all' || module.category === category;
		const inSearch =
			term === '' ||
			names(module.id).toLowerCase().includes(term) ||
			catalog(`blurb.${module.id}`).toLowerCase().includes(term);
		return inCategory && inSearch;
	});

	function replace(id: ModuleId, next: Partial<ModuleSummary>) {
		setItems((current) =>
			current.map((module) => (module.id === id ? { ...module, ...next } : module))
		);
	}

	async function toggle(id: ModuleId, enabled: boolean) {
		const current = items.find((module) => module.id === id);

		if (current === undefined || saving !== null) return;

		setSaving(id);
		replace(id, { status: enabled ? 'active' : 'off' });

		const result = await patchModule(guildId, id, { version: current.version, enabled });

		setSaving(null);

		if (result.status === 'error') {
			replace(id, { status: current.status });
			toast.error(result.message);
			return;
		}

		replace(id, { status: statusOf(result.state), version: result.state.version });

		if (result.status === 'conflict') {
			toast.warning(t('movedElsewhere', { name: names(id) }));
			return;
		}

		toast.success(
			result.state.enabled
				? t('turnedOn', { name: names(id) })
				: t('turnedOff', { name: names(id) })
		);
	}

	const activeCount = items.filter((module) => module.status === 'active').length;

	return (
		<div className="w-full p-6 sm:p-8">
			<div className="flex flex-col gap-4">
				<div>
					<h1 className="text-h1">{t('title')}</h1>
					<p className="text-body text-text-muted">
						{t('running', { active: activeCount, total: items.length })}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<SearchInput
						value={query}
						onValueChange={setQuery}
						placeholder={t('search')}
						aria-label={t('searchLabel')}
						className="max-w-80"
					/>

					<div
						role="group"
						aria-label={t('filter')}
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
								{catalog(`categories.${option}`)}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="mt-8">
				{matches.length === 0 ? (
					<EmptyState
						icon={PackageSearch}
						title={t('emptyTitle')}
						description={t('emptyBody', { brand: BRAND.name })}
					/>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-5">
						{matches.map((module) => (
							<ModuleCard
								key={module.id}
								module={module}
								guildId={guildId}
								busy={saving !== null}
								onToggle={(id, next) => {
									void toggle(id, next);
								}}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
