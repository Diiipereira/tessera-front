export const DOC_GROUP_IDS = ['start', 'concepts', 'modules', 'reference'] as const;

export type DocGroupId = (typeof DOC_GROUP_IDS)[number];

export const DOC_NAV: { id: DocGroupId; slugs: string[] }[] = [
	{
		id: 'start',
		slugs: [
			'',
			'getting-started/invite',
			'getting-started/permissions',
			'getting-started/first-module'
		]
	},
	{ id: 'concepts', slugs: ['concepts/config'] },
	{
		id: 'modules',
		slugs: [
			'modules/welcome',
			'modules/moderation',
			'modules/automod',
			'modules/logging',
			'modules/levels',
			'modules/economy',
			'modules/tickets',
			'modules/reaction-roles',
			'modules/giveaways',
			'modules/scheduled'
		]
	},
	{ id: 'reference', slugs: ['commands', 'troubleshooting'] }
];

export const ALL_DOC_SLUGS: string[] = DOC_NAV.flatMap((group) => group.slugs);
