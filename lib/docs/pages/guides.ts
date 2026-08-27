import type { DocPage } from '@/lib/docs/types';

export const INTRO_PAGE: DocPage = {
	slug: '',
	title: 'Introduction',
	summary: 'What Tessera is, and the one idea the rest of the documentation rests on.',
	blocks: [
		{
			kind: 'paragraph',
			text: 'Tessera is a Discord bot with eleven modules and a dashboard for configuring them. Everything the bot does is off until you turn it on, and every module has its own page here.'
		},
		{
			kind: 'callout',
			tone: 'info',
			title: 'This documentation is being written',
			text: 'The pages are in place and the structure is final. The reference tables will be generated from the bot’s own config registry rather than kept by hand, so what you read here always matches what the bot actually accepts.'
		},
		{ kind: 'heading', id: 'two-doors', text: 'Two doors, one room' },
		{
			kind: 'paragraph',
			text: 'A setting changed with a slash command and the same setting changed in the dashboard are **the same setting**. There is no sync, no import, no "push to Discord" button — both are doors into one stored config, and whichever you used last is what the bot is doing right now.'
		},
		{
			kind: 'paragraph',
			text: 'That sounds obvious and it is the hardest thing in the product to build. It is also why you can hand the dashboard to someone who has never used a slash command, and hand slash commands to someone who never opens a browser, and have them both be right.'
		},
		{ kind: 'heading', id: 'where-to-start', text: 'Where to start' },
		{
			kind: 'steps',
			items: [
				{
					title: 'Add the bot',
					text: 'One OAuth screen. You need **Manage Server** on the Discord server you are adding it to.'
				},
				{
					title: 'Turn on one module',
					text: 'Welcome is the usual first one, because it is the one members notice.'
				},
				{
					title: 'Come back for the rest',
					text: 'Every module works on its own. Nothing here needs anything else here to be useful.'
				}
			]
		},
		{ kind: 'heading', id: 'conventions', text: 'Conventions in these pages' },
		{
			kind: 'table',
			head: ['You see', 'It means'],
			rows: [
				['`code`', 'A literal value, a permission name, or something you type'],
				['**bold**', 'Something with a consequence worth reading twice'],
				['A blue note', 'Context you probably want'],
				['A yellow note', 'A limit or a plan requirement'],
				['A red note', 'Something that will bite you']
			]
		}
	]
};

export const GUIDE_PAGES: DocPage[] = [
	{
		slug: 'getting-started/invite',
		title: 'Adding the bot',
		summary: 'The OAuth screen, what it asks for, and what to do when the bot is quiet.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Adding Tessera is one OAuth screen. Discord asks you which server, and which permissions to grant; Tessera asks for nothing else.'
			},
			{
				kind: 'callout',
				tone: 'info',
				title: 'You need Manage Server',
				text: 'Discord only lists servers where you hold **Manage Server**. If a server is missing from the picker, that permission is why.'
			},
			{ kind: 'heading', id: 'steps', text: 'The steps' },
			{
				kind: 'steps',
				items: [
					{
						title: 'Press Add to Discord',
						text: 'From the landing page, or from the server picker in the dashboard.'
					},
					{
						title: 'Choose the server',
						text: 'Only servers where you have Manage Server appear.'
					},
					{
						title: 'Leave the permissions alone',
						text: 'The defaults are the union of what the modules need. Removing one here does not break the bot — the module that needs it simply refuses to save, and says which permission is missing.'
					},
					{
						title: 'Open the dashboard',
						text: 'The server appears in the picker within a few seconds of the bot joining.'
					}
				]
			},
			{ kind: 'heading', id: 'quiet', text: 'The bot joined but does nothing' },
			{
				kind: 'paragraph',
				text: 'That is expected. Every module is off until you turn it on. An freshly added bot sits in the member list and waits.'
			},
			{
				kind: 'callout',
				tone: 'warning',
				title: 'Role position matters more than permissions',
				text: 'A bot cannot act on a member whose highest role sits above its own, whatever permissions it has. If commands work on regular members and fail on moderators, drag the Tessera role up.'
			}
		]
	},
	{
		slug: 'getting-started/permissions',
		title: 'Permissions',
		summary: 'What each permission is for, and which module stops working without it.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Tessera asks for the union of what its modules need, and nothing beyond it. This page exists so you can hand it to whoever has to approve the invite.'
			},
			{
				kind: 'table',
				head: ['Permission', 'Used by', 'Without it'],
				rows: [
					['`View Channel`', 'Every module', 'The bot cannot read or post anywhere'],
					['`Send Messages`', 'Every module', 'Nothing is ever posted'],
					['`Embed Links`', 'Welcome, Logging, Giveaways', 'Messages fall back to plain text'],
					['`Manage Roles`', 'Welcome, Levels, Reaction roles, Economy', 'Roles are never granted'],
					['`Moderate Members`', 'Moderation, AutoMod', 'Timeouts fail'],
					['`Kick Members`', 'Moderation', 'The kick command is refused'],
					['`Ban Members`', 'Moderation', 'The ban command is refused'],
					['`Manage Messages`', 'AutoMod', 'Rules can warn and log but never delete'],
					['`Manage Channels`', 'Tickets', 'No ticket channel can be created'],
					['`Attach Files`', 'Tickets', 'Transcripts are not saved'],
					['`View Audit Log`', 'Logging', 'Events cannot be attributed to who caused them'],
					['`Add Reactions`', 'Reaction roles, Giveaways', 'Reaction-based panels do not work']
				]
			},
			{ kind: 'heading', id: 'hierarchy', text: 'Role hierarchy' },
			{
				kind: 'paragraph',
				text: 'Discord permissions are only half of it. A bot can never act on a member, or grant a role, that sits **above its own highest role** — no permission overrides that. Most "the bot ignores my moderators" reports are this.'
			},
			{
				kind: 'code',
				language: 'text',
				filename: 'role list, top to bottom',
				code: `Owner
Admin
Tessera          ← everything below this line can be actioned and granted
Moderator
Member
Muted`
			},
			{
				kind: 'callout',
				tone: 'danger',
				title: 'Administrator is not a shortcut',
				text: 'Granting Administrator does not lift the hierarchy rule, and it grants far more than any module uses. Position the role instead.'
			}
		]
	},
	{
		slug: 'getting-started/first-module',
		title: 'Your first module',
		summary: 'Turning on Welcome, end to end, including the part people get wrong.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Welcome is the usual first module because the result is immediately visible. This walks the whole thing, from off to a greeting members actually see.'
			},
			{
				kind: 'steps',
				items: [
					{
						title: 'Open the module',
						text: 'Dashboard → **Modules** → Welcome. Every module page looks like this one, so learning it once is enough.'
					},
					{
						title: 'Turn it on',
						text: 'The switch at the top right. Everything below it stays editable while it is off, so you can set it up before it goes live.'
					},
					{
						title: 'Pick the channel',
						text: 'Where the greeting goes. The module cannot be turned on without one, so this is the field that decides whether the switch works.'
					},
					{
						title: 'Write the message',
						text: 'Use `{user}` for the member who joined and `{server}` for the server name. The preview updates as you type.'
					},
					{
						title: 'Check it with a real join',
						text: 'Invite a second account, or ask someone to rejoin. The preview shows the layout, but only a real join proves the bot has the permissions it needs in that channel.'
					}
				]
			},
			{
				kind: 'callout',
				tone: 'info',
				title: 'The same thing from Discord',
				text: 'Every step above has a slash command. `/welcome channel #general` does the third one, and the dashboard shows it the moment you run it.'
			}
		]
	},
	{
		slug: 'concepts/config',
		title: 'How config is stored',
		summary: 'One writer, two doors — and why that shapes everything else.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'A configuration field in Tessera is declared **once**. That single declaration produces the slash command option, the dashboard form control, the validation the API runs, and the shape it is stored in. Nothing is written twice, which is the only reliable way to stop the two doors from disagreeing.'
			},
			{ kind: 'heading', id: 'consequences', text: 'What follows from that' },
			{
				kind: 'list',
				items: [
					'A slash command and the dashboard can never accept different values for the same field, because the validation is the same object.',
					'A field added to a module appears in both places at once, or in neither.',
					'This documentation’s option tables are generated from that declaration too, so they cannot describe a setting the bot does not have.',
					'There is no import, export or sync step anywhere in the product.'
				]
			},
			{ kind: 'heading', id: 'saving', text: 'What happens when you save' },
			{
				kind: 'steps',
				items: [
					{
						title: 'The write is validated',
						text: 'Against the same rules the slash command uses.'
					},
					{
						title: 'The version is checked',
						text: 'If someone else saved the same module while you had the page open, your save is refused rather than silently overwriting theirs.'
					},
					{
						title: 'The bot is told',
						text: 'The gateway process drops its cached copy immediately, so the next message is handled with the new config — not on a timer.'
					}
				]
			},
			{
				kind: 'callout',
				tone: 'warning',
				title: 'Two people editing one module',
				text: 'The second save is refused with a message saying so. Reload, look at what changed, and save again. Nothing is lost, but nothing is merged for you either.'
			},
			{ kind: 'heading', id: 'audit', text: 'Everything is written down' },
			{
				kind: 'paragraph',
				text: 'Every write is recorded with who made it, which door they came through, and the exact before and after of each field. The audit log in the dashboard is that record, and it is the same record whether the change came from a slash command, the dashboard or the API.'
			}
		]
	},
	{
		slug: 'concepts/plans',
		title: 'Plans and limits',
		summary: 'What the free plan includes, and exactly what Pro raises.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Every module is visible on every plan, including the ones you cannot save. That is deliberate — you should be able to see what you would get before deciding whether you want it.'
			},
			{
				kind: 'table',
				head: ['Limit', 'Free', 'Pro', 'Ultimate'],
				rows: [
					['AutoMod rules', '5', '20', 'Unlimited'],
					['Custom commands', '10', '50', 'Unlimited'],
					['Ticket panels', '1', '5', 'Unlimited'],
					['Reaction role panels', '2', '10', 'Unlimited'],
					['Audit log retention', '30 days', '180 days', '1 year'],
					['Economy module', '—', '—', 'Included'],
					['Scheduled messages', '—', 'Included', 'Included']
				]
			},
			{
				kind: 'callout',
				tone: 'info',
				title: 'Downgrading never deletes anything',
				text: 'Going over a limit locks the module for editing and keeps what you already configured. Come back under the limit, or upgrade, and it unlocks exactly as it was.'
			}
		]
	},
	{
		slug: 'troubleshooting',
		title: 'Troubleshooting',
		summary: 'The failures that come up most, and what actually causes them.',
		blocks: [
			{
				kind: 'paragraph',
				text: 'Nearly every report falls into one of these. They are ordered by how often they turn out to be the answer.'
			},
			{ kind: 'heading', id: 'nothing-happens', text: 'The bot does nothing' },
			{
				kind: 'list',
				ordered: true,
				items: [
					'The module is off. Every module ships off and stays off until you turn it on.',
					'The bot cannot see the channel. A channel the bot cannot view is locked in every picker — if yours is selectable, this is not it.',
					'The Tessera role sits below the member you are acting on. Position beats permission, always.',
					'The command is disabled for that role or channel on the **Commands** page.'
				]
			},
			{ kind: 'heading', id: 'roles', text: 'Roles are not being granted' },
			{
				kind: 'paragraph',
				text: 'A bot can only grant roles **below its own highest role**. Roles above it are locked in the picker for exactly this reason, so if the role was selectable and still is not granted, check whether it moved since.'
			},
			{ kind: 'heading', id: 'slow', text: 'A slash command does not appear in Discord' },
			{
				kind: 'paragraph',
				text: 'Newly registered command names can take a minute to propagate, and Discord caches them per client. Reconnecting the Discord client is faster than waiting.'
			},
			{ kind: 'heading', id: 'save-refused', text: 'A save was refused' },
			{
				kind: 'paragraph',
				text: 'Someone else saved the same module while your page was open. Reload and look at the audit log — it shows who, when, and what they changed — then make your change again on top of theirs.'
			},
			{
				kind: 'callout',
				tone: 'info',
				title: 'Still stuck',
				text: 'The support server is the fastest route, and the audit log entry for the change usually answers the question before anyone has to.'
			}
		]
	}
];
