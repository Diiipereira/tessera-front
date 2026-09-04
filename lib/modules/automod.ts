import type { GuildModuleStateDto } from '@/lib/api-url';
import type {
	AutoModAction,
	AutoModConfig,
	AutoModRule,
	AutoModTrigger
} from '@/lib/types/module-configs';

export const MAX_RULES = 50;

export const MAX_WORDS = 200;

export const MAX_WORD_LENGTH = 64;

export const MAX_RULE_NAME_LENGTH = 80;

export const MIN_THRESHOLD = 1;

export const MAX_THRESHOLD = 100;

export const MIN_WINDOW_SECONDS = 1;

export const MAX_WINDOW_SECONDS = 3600;

export type AutomodRuleDto = {
	id: string;
	name: string;
	trigger: AutoModTrigger;
	threshold: number;
	windowSeconds: number;
	actions: AutoModAction[];
	exemptRoleIds: string[];
	exemptChannelIds: string[];
	words: string[];
	enabled: boolean;
};

export type AutomodRulePayload = Omit<AutomodRuleDto, 'id'>;

export type FiredReason =
	| { kind: 'spam'; count: number; limit: number }
	| { kind: 'attachments'; count: number; limit: number }
	| { kind: 'invites'; count: number }
	| { kind: 'links'; count: number }
	| { kind: 'caps'; ratio: number; limit: number }
	| { kind: 'mentions'; count: number; limit: number }
	| { kind: 'words'; found: string[] };

export type AutomodFired = {
	name: string;
	reason: FiredReason;
};

export type AutomodReading = {
	fired: AutomodFired[];
	untestable: string[];
};

export const toAutoModConfig = (
	state: GuildModuleStateDto,
	rules: readonly AutomodRuleDto[]
): AutoModConfig => ({
	enabled: state.enabled,
	rules: rules.map((rule) => ({
		id: rule.id,
		name: rule.name,
		trigger: rule.trigger,
		threshold: rule.threshold,
		windowSeconds: rule.windowSeconds,
		actions: [...rule.actions],
		exemptRoleIds: [...rule.exemptRoleIds],
		exemptChannelIds: [...rule.exemptChannelIds],
		words: [...rule.words],
		enabled: rule.enabled
	}))
});

export const cleanWords = (words: readonly string[]): string[] => {
	const kept: string[] = [];

	for (const word of words) {
		const trimmed = word.trim();

		if (trimmed !== '' && !kept.includes(trimmed)) kept.push(trimmed);
	}

	return kept.slice(0, MAX_WORDS);
};

export const toRulePayload = (rules: readonly AutoModRule[]): AutomodRulePayload[] =>
	rules.map((rule) => ({
		name: rule.name.trim(),
		trigger: rule.trigger,
		threshold: rule.threshold,
		windowSeconds: rule.windowSeconds,
		actions: [...rule.actions],
		exemptRoleIds: [...rule.exemptRoleIds],
		exemptChannelIds: [...rule.exemptChannelIds],
		words: cleanWords(rule.words),
		enabled: rule.enabled
	}));

export const incomplete = (rule: AutoModRule): 'name' | 'words' | 'actions' | null => {
	if (rule.name.trim() === '') return 'name';
	if (rule.actions.length === 0) return 'actions';
	if (rule.trigger === 'words' && cleanWords(rule.words).length === 0) return 'words';

	return null;
};

export const testable = (rules: readonly AutoModRule[]): boolean =>
	rules.every((rule) => incomplete(rule) === null);
