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
	}
} as const satisfies Record<string, Help>;

export const HELP_IDS = Object.keys(MODULE_HELP) as (keyof typeof MODULE_HELP)[];
