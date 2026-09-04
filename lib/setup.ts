import type { GuildModuleStateDto } from '@/lib/api-url';
import { hasScreen } from '@/lib/modules/catalog';
import type { GuildSettings } from '@/lib/types/management';
import type { ModuleId } from '@/lib/types/modules';

export const SETUP_DEFAULTS: readonly ModuleId[] = ['welcome', 'moderation', 'logging'];

export type SetupModule = {
	id: ModuleId;
	version: number;
	enabled: boolean;
	config: Record<string, unknown>;
};

export type SetupDraft = {
	locale: string;
	timezone: string;
	wanted: readonly ModuleId[];
	logChannelId: string | null;
	welcomeChannelId: string | null;
	protectedRoleIds: readonly string[];
};

export type SetupWrite = {
	id: ModuleId;
	version: number;
	enabled: boolean;
	config: Record<string, unknown>;
};

export function toSetupModules(states: readonly GuildModuleStateDto[]): SetupModule[] {
	return states.flatMap((state) =>
		hasScreen(state.key)
			? [{ id: state.key, version: state.version, enabled: state.enabled, config: state.config }]
			: []
	);
}

const configOf = (modules: readonly SetupModule[], id: ModuleId): Record<string, unknown> =>
	modules.find((module) => module.id === id)?.config ?? {};

const readId = (config: Record<string, unknown>, key: string): string | null => {
	const value = config[key];

	return typeof value === 'string' && value !== '' ? value : null;
};

const readIds = (config: Record<string, unknown>, key: string): string[] => {
	const value = config[key];

	return Array.isArray(value)
		? value.filter((entry): entry is string => typeof entry === 'string')
		: [];
};

export const startingModules = (modules: readonly SetupModule[]): ModuleId[] => {
	const configured = modules.filter((module) => module.enabled).map((module) => module.id);

	return configured.length > 0
		? configured
		: SETUP_DEFAULTS.filter((id) => modules.some((module) => module.id === id));
};

export function startingDraft(
	settings: GuildSettings,
	modules: readonly SetupModule[]
): SetupDraft {
	const moderation = configOf(modules, 'moderation');

	return {
		locale: settings.locale,
		timezone: settings.timezone,
		wanted: startingModules(modules),
		logChannelId: readId(moderation, 'logChannelId'),
		welcomeChannelId: readId(configOf(modules, 'welcome'), 'channelId'),
		protectedRoleIds: readIds(moderation, 'protectedRoleIds')
	};
}

function configFor(id: ModuleId, draft: SetupDraft): Record<string, unknown> {
	if (id === 'welcome') {
		return draft.welcomeChannelId === null ? {} : { channelId: draft.welcomeChannelId };
	}

	if (id === 'moderation') {
		return {
			...(draft.logChannelId === null ? {} : { logChannelId: draft.logChannelId }),
			protectedRoleIds: [...draft.protectedRoleIds]
		};
	}

	return {};
}

export function toSetupWrites(modules: readonly SetupModule[], draft: SetupDraft): SetupWrite[] {
	const wanted = new Set(draft.wanted);

	return modules.flatMap((module): SetupWrite[] => {
		const enabled = wanted.has(module.id);
		const config = configFor(module.id, draft);
		const untouched = enabled === module.enabled && Object.keys(config).length === 0;

		return untouched ? [] : [{ id: module.id, version: module.version, enabled, config }];
	});
}

export const needsWelcomeChannel = (draft: SetupDraft): boolean =>
	draft.wanted.includes('welcome') && draft.welcomeChannelId === null;
