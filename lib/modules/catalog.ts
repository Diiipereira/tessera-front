import type { GuildModuleStateDto } from '@/lib/api-url';
import {
	MODULE_CATEGORIES,
	MODULE_IDS,
	type ModuleCategory,
	type ModuleId,
	type ModuleStatus,
	type ModuleSummary
} from '@/lib/types/modules';

export type ModuleCatalogEntryDto = {
	key: string;
	category: string;
	i18nLabel: string;
	i18nDescription: string;
	fields: unknown[];
};

export type ModuleCatalogDto = {
	modules: ModuleCatalogEntryDto[];
};

export const hasScreen = (key: string): key is ModuleId =>
	MODULE_IDS.some((screen) => screen === key);

export const isCategory = (value: string): value is ModuleCategory =>
	MODULE_CATEGORIES.some((category) => category === value);

export function statusOf(state: GuildModuleStateDto): ModuleStatus {
	if (state.enabled) return 'active';

	return state.configured ? 'off' : 'needs-setup';
}

export function toModuleSummaries(
	catalog: ModuleCatalogDto,
	states: readonly GuildModuleStateDto[]
): ModuleSummary[] {
	const byKey = new Map(states.map((state) => [state.key, state]));

	return catalog.modules.flatMap((entry): ModuleSummary[] => {
		const state = byKey.get(entry.key);

		if (state === undefined || !hasScreen(entry.key) || !isCategory(entry.category)) return [];

		return [
			{
				id: entry.key,
				category: entry.category,
				status: statusOf(state),
				version: state.version
			}
		];
	});
}
