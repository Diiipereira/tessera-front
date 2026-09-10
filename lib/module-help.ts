type Help = { namespace: string; points: readonly string[] };

export const MODULE_HELP = {
	image: {
		namespace: 'modules.imageHelp',
		points: ['direct', 'public', 'attachment', 'host']
	},
	welcomeMention: {
		namespace: 'modules.welcome.mention.help',
		points: ['none', 'inline', 'ghost', 'ghostText']
	},
	welcomeAutorole: {
		namespace: 'modules.welcome.autorole.help',
		points: ['above', 'permission', 'managed', 'join']
	},
	welcomeCleanup: {
		namespace: 'modules.welcome.cleanup.help',
		points: ['own', 'ghost', 'restart']
	},
	moderationMuted: {
		namespace: 'modules.moderation.muted.help',
		points: ['timeout', 'mute', 'channels', 'missing']
	},
	moderationProtected: {
		namespace: 'modules.moderation.protected.help',
		points: ['punishments', 'escalation', 'reversal', 'remove']
	},
	moderationPurge: {
		namespace: 'modules.moderation.defaults.help',
		points: ['window', 'gone', 'ban', 'softban', 'override']
	},
	moderationDm: {
		namespace: 'modules.moderation.dm.help',
		points: ['before', 'blocked', 'failure', 'kick']
	},
	moderationEscalation: {
		namespace: 'modules.moderation.escalation.help',
		points: ['counting', 'oneStep', 'who']
	},
	moderationPoints: {
		namespace: 'modules.moderation.ladder.pointsHelp',
		points: ['light', 'moderate', 'heavy', 'severe', 'total', 'grading']
	},
	moderationAutoActions: {
		namespace: 'modules.moderation.escalation.autoHelp',
		points: ['unchecked', 'duration', 'protected', 'dm']
	},
	moderationWindow: {
		namespace: 'modules.moderation.escalation.windowHelp',
		points: ['rolling', 'kept', 'revoked']
	},
	automodRules: {
		namespace: 'modules.automod.rules.help',
		points: ['together', 'harshest', 'moderation', 'ladder', 'save']
	},
	automodPlayground: {
		namespace: 'modules.automod.playground.help',
		points: ['draft', 'exempt', 'history', 'all']
	},
	automodTrigger: {
		namespace: 'modules.automod.dialog.triggerHelp',
		points: ['spam', 'invites', 'links', 'caps', 'mentions', 'words', 'attachments']
	},
	automodWords: {
		namespace: 'modules.automod.dialog.wordsHelp',
		points: ['whole', 'case', 'phrase', 'limit']
	},
	automodThreshold: {
		namespace: 'modules.automod.dialog.thresholdHelp',
		points: ['atLeast', 'caps', 'window', 'range']
	},
	automodActions: {
		namespace: 'modules.automod.dialog.actionHelp',
		points: ['delete', 'harshest', 'timeout', 'log']
	},
	automodExempt: {
		namespace: 'modules.automod.dialog.exemptHelp',
		points: ['any', 'channel', 'bots']
	}
} as const satisfies Record<string, Help>;

export const HELP_IDS = Object.keys(MODULE_HELP) as (keyof typeof MODULE_HELP)[];
