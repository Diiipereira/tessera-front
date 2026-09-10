import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ReactionMode, ReactionPanel, ReactionRolesConfig } from '@/lib/types/module-configs';
import { toEmbedDraft } from './welcome';

export const MAX_PANELS = 25;

export const MAX_OPTIONS = 25;

export const MAX_PANEL_NAME_LENGTH = 100;

export const MAX_OPTION_LABEL_LENGTH = 80;

export const MAX_OPTION_DESCRIPTION_LENGTH = 100;

export const MAX_PANEL_MESSAGE_LENGTH = 2000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReactionOptionDto = {
	id: string;
	roleId: string;
	emoji: string | null;
	label: string;
	description: string;
};

export type ReactionPanelDto = {
	id: string;
	name: string;
	channelId: string | null;
	messageId: string | null;
	message: string;
	embed: Record<string, unknown>;
	mode: ReactionMode;
	useButtons: boolean;
	enabled: boolean;
	options: ReactionOptionDto[];
};

export type ReactionOptionPayload = Omit<ReactionOptionDto, 'id'>;

export type ReactionPanelPayload = {
	id: string | null;
	name: string;
	channelId: string | null;
	message: string;
	embed: Record<string, unknown>;
	mode: ReactionMode;
	useButtons: boolean;
	enabled: boolean;
	options: ReactionOptionPayload[];
};

export const isSavedId = (id: string): boolean => UUID.test(id);

export const toReactionRolesConfig = (
	state: GuildModuleStateDto,
	panels: readonly ReactionPanelDto[],
	defaultColor?: string
): ReactionRolesConfig => ({
	enabled: state.enabled,
	panels: panels.map((panel) => ({
		id: panel.id,
		name: panel.name,
		channelId: panel.channelId,
		message: {
			mode: Object.keys(panel.embed).length > 0 ? 'embed' : 'text',
			text: panel.message,
			embed: toEmbedDraft(panel.embed, defaultColor)
		},
		mode: panel.mode,
		useButtons: panel.useButtons,
		options: panel.options.map((option) => ({
			id: option.id,
			emoji: option.emoji ?? '',
			roleId: option.roleId,
			label: option.label,
			description: option.description
		}))
	}))
});

export const roleless = (panel: ReactionPanel): number =>
	panel.options.filter((option) => option.roleId === null).length;

export const unfinished = (panels: readonly ReactionPanel[]): number =>
	panels.filter((panel) => panel.name.trim() === '' || roleless(panel) > 0).length;

export const toPanelPayload = (panels: readonly ReactionPanel[]): ReactionPanelPayload[] =>
	panels.map((panel) => ({
		id: isSavedId(panel.id) ? panel.id : null,
		name: panel.name.trim().slice(0, MAX_PANEL_NAME_LENGTH),
		channelId: panel.channelId,
		message: panel.message.text.slice(0, MAX_PANEL_MESSAGE_LENGTH),
		embed: panel.message.mode === 'embed' ? { ...panel.message.embed } : {},
		mode: panel.mode,
		useButtons: panel.useButtons,
		enabled: true,
		options: panel.options
			.filter((option): option is typeof option & { roleId: string } => option.roleId !== null)
			.slice(0, MAX_OPTIONS)
			.map((option) => ({
				roleId: option.roleId,
				emoji: option.emoji.trim() === '' ? null : option.emoji.trim(),
				label: option.label.slice(0, MAX_OPTION_LABEL_LENGTH),
				description: option.description.slice(0, MAX_OPTION_DESCRIPTION_LENGTH)
			}))
	}));
