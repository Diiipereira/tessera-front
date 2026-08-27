import type { DocBlock, DocOption, DocPage, DocStep } from '@/lib/docs/types';
import type { ModuleId } from '@/lib/types/modules';

type ModuleDoc = {
	id: ModuleId;
	title: string;
	summary: string;
	lead: string;
	permissions: string[];
	steps: DocStep[];
	options: DocOption[];
	extra?: DocBlock[];
};

const MODULE_DOCS: ModuleDoc[] = [
	{
		id: 'welcome',
		title: 'Welcome',
		summary: 'Greet new members and give them their first roles.',
		lead: 'Welcome posts a message the moment someone joins and can hand them a role on the way in. It is the module most servers turn on first, because it is the one members notice.',
		permissions: ['View Channel', 'Send Messages', 'Embed Links', 'Manage Roles'],
		steps: [
			{
				title: 'Pick the channel',
				text: 'Where the greeting is posted. The bot needs **Send Messages** there, and **Embed Links** as well if you send an embed.'
			},
			{
				title: 'Write the message',
				text: 'Plain text or an embed. Both accept the same variables — `{user}` and `{server}`.'
			},
			{
				title: 'Turn it on',
				text: 'The module stays off until you enable it, and it cannot be enabled without a channel. Nothing is posted while it is off.'
			}
		],
		options: [
			{
				name: 'Channel',
				type: 'channel',
				fallback: 'none',
				text: 'Where the greeting is posted. Required before the module can be turned on.'
			},
			{
				name: 'Message mode',
				type: 'text | embed',
				fallback: '`text`',
				text: 'An embed gets a title, a colour, images and fields; plain text does not.'
			},
			{
				name: 'Message',
				type: 'string',
				fallback: '`Welcome {user} to {server}!`',
				text: 'The body, up to 2000 characters. Variables are replaced when it is posted, not when it is saved.'
			},
			{
				name: 'Roles to assign',
				type: 'role[]',
				fallback: 'none',
				text: 'Given automatically on join. Roles Discord manages itself — bot, integration and booster roles — are locked, because nobody can hand those out.'
			}
		],
		extra: [
			{ kind: 'heading', id: 'variables', text: 'Variables' },
			{
				kind: 'paragraph',
				text: 'Every message field in this module accepts the same two. That includes each part of an embed — its title, its description and its fields. Anything the bot cannot resolve is left as written rather than blanked, so a typo is visible instead of invisible.'
			},
			{
				kind: 'table',
				head: ['Variable', 'Becomes'],
				rows: [
					['`{user}`', 'The member who joined'],
					['`{server}`', 'The server name']
				]
			},
			{
				kind: 'paragraph',
				text: 'Whether `{user}` becomes a real ping or just a name is decided by the module’s mention setting, not by the variable.'
			}
		]
	},
	{
		id: 'moderation',
		title: 'Moderation',
		summary: 'Warns, timeouts, mutes and bans — every one of them written to the case log.',
		lead: 'Moderation is the case log plus the commands that write to it. Every punishment opens a case, whether it came from a slash command, the dashboard, or an AutoMod rule firing on its own.',
		permissions: ['Kick Members', 'Ban Members', 'Moderate Members', 'Manage Roles'],
		steps: [
			{
				title: 'Name the moderator roles',
				text: 'These roles get the moderation commands and the dashboard actions. Nobody else can run them, whatever their Discord permissions say.'
			},
			{
				title: 'Protect the roles that matter',
				text: 'A protected role cannot be actioned by the bot, so a moderator cannot ban an admin by mistake.'
			},
			{
				title: 'Decide what the member is told',
				text: 'The DM is sent **before** the punishment lands, so a ban still reaches them.'
			}
		],
		options: [
			{
				name: 'Moderator roles',
				type: 'role[]',
				fallback: 'none',
				text: 'These roles get the moderation commands and the dashboard actions.'
			},
			{
				name: 'Protected roles',
				type: 'role[]',
				fallback: 'none',
				text: 'Members holding one of these cannot be warned, muted, kicked or banned by the bot.'
			},
			{
				name: 'Default timeout',
				type: 'duration',
				fallback: '`1h`',
				text: 'What a moderator gets when they run a command without a duration.'
			},
			{
				name: 'Mute role',
				type: 'role',
				fallback: 'none',
				text: 'Used by the mute command. Discord timeouts do not need one; a mute that outlives 28 days does.'
			},
			{
				name: 'On ban',
				type: 'none | 1d | 7d',
				fallback: '`none`',
				text: 'How much of the member’s recent message history is purged with the ban.'
			},
			{
				name: 'Require a reason',
				type: 'boolean',
				fallback: 'on',
				text: 'The command is refused without one. The case log is only useful if it is filled in.'
			},
			{
				name: 'Appeal link',
				type: 'url',
				fallback: '—',
				text: 'Added to the bottom of the message when set.'
			}
		],
		extra: [
			{ kind: 'heading', id: 'cases', text: 'Cases' },
			{
				kind: 'paragraph',
				text: 'A case is opened by every punishment and never deleted — revoking one marks it revoked and keeps the history. Cases are numbered per server and the number is what members quote in an appeal.'
			},
			{
				kind: 'callout',
				tone: 'warning',
				title: 'Editing a reason is logged',
				text: 'The original text stays in the case history with who changed it and when. There is no silent edit.'
			}
		]
	},
	{
		id: 'automod',
		title: 'AutoMod',
		summary: 'Rules that act before a human has to. Every hit is written to the case log.',
		lead: 'AutoMod watches messages as they arrive and acts on the ones that match a rule you wrote. It runs before any moderator sees the message, which is the point — the worst content is the content nobody had to read.',
		permissions: ['Manage Messages', 'Moderate Members', 'View Audit Log'],
		steps: [
			{
				title: 'Add a rule',
				text: 'Pick what it watches for — blocked words, invites, links, mentions, repeated text or caps — then what happens when it fires.'
			},
			{
				title: 'Order the rules',
				text: 'Rules are checked top to bottom and **the first rule that fires wins**. Put the narrow ones above the broad ones.'
			},
			{
				title: 'Test it before you trust it',
				text: 'Paste something a member might send into the sample box and the dashboard shows which rules would catch it, in order.'
			}
		],
		options: [
			{
				name: 'Name',
				type: 'string',
				fallback: '—',
				text: 'Shown in the case log when the rule fires, so name it after what it catches.'
			},
			{
				name: 'Blocked words',
				type: 'string[]',
				fallback: 'none',
				text: 'Matched on word boundaries, case-insensitively. Leading and trailing punctuation is ignored.'
			},
			{
				name: 'Threshold',
				type: 'number',
				fallback: '`1`',
				text: 'How many hits inside the window before the rule fires.'
			},
			{
				name: 'Within (seconds)',
				type: 'number',
				fallback: '`0`',
				text: 'The window the threshold is counted over. `0` means the rule fires on the first hit.'
			},
			{
				name: 'Actions',
				type: 'delete | warn | timeout | log',
				fallback: '`delete`',
				text: 'Any combination. A rule with no action still writes a case, which is useful while you are tuning it.'
			},
			{
				name: 'Never applies to these roles',
				type: 'role[]',
				fallback: 'none',
				text: 'Members holding one of these are skipped entirely by the rule.'
			},
			{
				name: 'Never applies in this channel',
				type: 'channel[]',
				fallback: 'none',
				text: 'Useful for a staff channel where the raw content has to be quotable.'
			}
		],
		extra: [
			{ kind: 'heading', id: 'order', text: 'Why order matters' },
			{
				kind: 'paragraph',
				text: 'Because the first match wins, a broad rule above a narrow one makes the narrow one unreachable. The dashboard shows the evaluation order and the sample tester follows it exactly, so an unreachable rule is visible rather than mysterious.'
			},
			{
				kind: 'code',
				language: 'text',
				filename: 'evaluation order',
				code: `1  Invite links        → delete, warn, log        fires
2  Blocked words       → delete, timeout 10m      not reached, message already deleted
3  Mass mentions (>5)  → delete, timeout 1h       not reached`
			}
		]
	},
	{
		id: 'logging',
		title: 'Logging',
		summary: 'Write server events to a channel. Turn on only what you will actually read.',
		lead: 'Logging writes what happened to a channel you choose. The temptation is to turn everything on; the advice is not to, because a log nobody reads is worse than no log — it looks like coverage.',
		permissions: ['View Channel', 'Send Messages', 'Embed Links', 'View Audit Log'],
		steps: [
			{
				title: 'Pick the channel',
				text: 'Make it staff-only. Deleted message content ends up here.'
			},
			{
				title: 'Choose the events',
				text: 'Start with joins, leaves, deletes and moderation actions. Add more when you find yourself wishing you had them.'
			},
			{
				title: 'Exclude the noise',
				text: 'Ignored channels and roles are absolute — nothing from them is ever logged, whatever the events say.'
			}
		],
		options: [
			{
				name: 'Channel',
				type: 'channel',
				fallback: 'none',
				text: 'Where events are written. One channel for everything.'
			},
			{
				name: 'Events',
				type: 'event[]',
				fallback: 'none',
				text: 'Message deletes and edits, joins and leaves, role and nickname changes, channel changes, moderation actions.'
			},
			{
				name: 'Ignored channels',
				type: 'channel[]',
				fallback: 'none',
				text: 'Nothing from these is ever logged, whatever the events say.'
			},
			{
				name: 'Ignored roles',
				type: 'role[]',
				fallback: 'none',
				text: 'Good for bots that would otherwise fill the log with their own messages.'
			}
		]
	},
	{
		id: 'levels',
		title: 'Levels',
		summary: 'XP for talking, ranks to show for it, and roles handed out along the way.',
		lead: 'Levels gives a random amount of XP per message, at most once per cooldown, and hands out roles when a member crosses a level you picked. The randomness and the cooldown together are what stop it from rewarding spam.',
		permissions: ['View Channel', 'Send Messages', 'Manage Roles'],
		steps: [
			{
				title: 'Set the XP range',
				text: 'A random amount between the minimum and maximum is granted per message, at most once per cooldown.'
			},
			{
				title: 'Choose a difficulty',
				text: 'Difficulty is how much harder each level is than the one before it. The preview shows what the first ten levels cost.'
			},
			{
				title: 'Add role rewards',
				text: 'Given when a member reaches the level. Roles above the bot in the list cannot be granted.'
			}
		],
		options: [
			{
				name: 'Minimum XP',
				type: 'number',
				fallback: '`15`',
				text: 'The floor of the per-message grant.'
			},
			{
				name: 'Maximum XP',
				type: 'number',
				fallback: '`25`',
				text: 'The ceiling. Equal to the minimum makes the grant fixed.'
			},
			{
				name: 'Cooldown (seconds)',
				type: 'number',
				fallback: '`60`',
				text: 'A random amount per message, at most once per cooldown.'
			},
			{
				name: 'Voice XP per minute',
				type: 'number',
				fallback: '`0`',
				text: '0 turns voice XP off. Members alone in a channel never earn it.'
			},
			{
				name: 'Difficulty',
				type: 'gentle | normal | steep',
				fallback: '`normal`',
				text: 'How much harder each level is than the one before it.'
			},
			{
				name: 'Announce level-ups',
				type: 'boolean',
				fallback: 'on',
				text: 'Off keeps the XP and drops the message.'
			},
			{
				name: 'Reply where they levelled up',
				type: 'boolean',
				fallback: 'on',
				text: 'Instead of always posting in one channel.'
			},
			{
				name: 'No-XP channels',
				type: 'channel[]',
				fallback: 'none',
				text: 'Nothing said in these earns anything.'
			}
		],
		extra: [
			{ kind: 'heading', id: 'curve', text: 'The curve' },
			{
				kind: 'paragraph',
				text: 'Level *n* costs a fixed multiple of level *n − 1*. Changing the difficulty does not reset anyone — existing XP is kept and re-read against the new curve, so members can gain or lose a level the moment you save.'
			},
			{
				kind: 'callout',
				tone: 'info',
				title: 'Role rewards are not retroactive by default',
				text: 'Members already past the level keep their current roles until they next level up, unless you run the backfill from the module page.'
			}
		]
	},
	{
		id: 'economy',
		title: 'Economy',
		summary: 'A currency members earn by showing up, and something to spend it on.',
		lead: 'Economy is a currency, two ways to earn it, and a shop to spend it in. It is the module that most rewards being left alone for a few weeks — the numbers only mean something once people have been earning for a while.',
		permissions: ['View Channel', 'Send Messages', 'Manage Roles'],
		steps: [
			{
				title: 'Name the currency',
				text: 'A name and a symbol. One character reads best as the symbol.'
			},
			{
				title: 'Set what it hands out',
				text: 'A daily claim with a streak bonus, and a work command on a shorter cooldown.'
			},
			{
				title: 'Fill the shop',
				text: 'What the currency actually buys. An item can grant a role, and can have limited stock.'
			}
		],
		options: [
			{
				name: 'Name',
				type: 'string',
				fallback: '`coins`',
				text: 'Used everywhere the amount is written out.'
			},
			{ name: 'Symbol', type: 'string', fallback: '`⏣`', text: 'One character reads best.' },
			{
				name: 'Starting balance',
				type: 'number',
				fallback: '`0`',
				text: 'What a member has the first time they are seen.'
			},
			{
				name: 'Daily amount',
				type: 'number',
				fallback: '`100`',
				text: 'Claimed with the daily command, once per cooldown.'
			},
			{
				name: 'Streak bonus',
				type: 'number',
				fallback: '`10`',
				text: 'Added per consecutive day claimed. Missing a day resets it to zero.'
			},
			{
				name: 'Transfer tax (%)',
				type: 'number',
				fallback: '`0`',
				text: 'What it costs to send currency to someone. Taken from the sender.'
			},
			{
				name: 'Limited stock',
				type: 'boolean',
				fallback: 'off',
				text: 'Once it runs out the item stops selling.'
			},
			{
				name: 'Limit per member',
				type: 'number',
				fallback: 'none',
				text: 'How many times one member may buy the same item.'
			}
		],
		extra: [
			{
				kind: 'callout',
				tone: 'warning',
				title: 'Economy is a Pro module',
				text: 'It is visible on every plan so you can see what it does, but saving its config needs Pro.'
			},
			{ kind: 'heading', id: 'ledger', text: 'The ledger' },
			{
				kind: 'paragraph',
				text: 'Every movement of currency is written down — earned, spent, transferred, granted by staff — and the list on the module page is read-only. Balances are derived from it rather than stored on their own, so a balance cannot drift away from its history.'
			}
		]
	},
	{
		id: 'tickets',
		title: 'Tickets',
		summary: 'A button members press to open a private channel with your staff.',
		lead: 'A ticket panel is one message with one button. Pressing it opens a private channel between the member and your staff roles, and closing it can save a transcript.',
		permissions: ['Manage Channels', 'View Channel', 'Send Messages', 'Attach Files'],
		steps: [
			{
				title: 'Create a panel',
				text: 'Each panel is one message with one button. What sits above the button is yours to write.'
			},
			{
				title: 'Point it at a category',
				text: 'New ticket channels are created inside it, so the category permissions are the ones that matter.'
			},
			{
				title: 'Name your staff roles',
				text: 'They are added to every ticket the panel opens. Applies to every panel.'
			}
		],
		options: [
			{
				name: 'Panel name',
				type: 'string',
				fallback: '—',
				text: 'Internal only — members never see it.'
			},
			{
				name: 'Category',
				type: 'channel',
				fallback: 'none',
				text: 'Ticket channels are created inside it.'
			},
			{
				name: 'Staff roles',
				type: 'role[]',
				fallback: 'none',
				text: 'Added to every ticket. Applies to every panel.'
			},
			{
				name: 'Channel naming',
				type: 'string',
				fallback: '`ticket-{number}`',
				text: 'Accepts `{number}`, `{user}` and `{panel}`.'
			},
			{
				name: 'Max open per member',
				type: 'number',
				fallback: '`1`',
				text: 'The button is refused once a member is at the limit.'
			},
			{
				name: 'Save a transcript when a ticket closes',
				type: 'boolean',
				fallback: 'on',
				text: 'Written to the log channel as a file.'
			},
			{
				name: 'Auto-close after (hours of silence)',
				type: 'number',
				fallback: '`0`',
				text: '0 turns it off. The member is warned before it closes.'
			}
		],
		extra: [
			{
				kind: 'callout',
				tone: 'info',
				title: 'Claiming and closing happen in Discord',
				text: 'The tickets list on the dashboard is read-only. It is there to see the queue, not to work it.'
			}
		]
	},
	{
		id: 'reaction-roles',
		title: 'Reaction roles',
		summary: 'Members pick their own roles, without asking staff.',
		lead: 'A panel is one message and one row per role a member can pick. Buttons are the default because they are clearer and cannot be removed by accident.',
		permissions: ['Manage Roles', 'Send Messages', 'Add Reactions'],
		steps: [
			{
				title: 'Write the panel',
				text: 'One message, posted in the channel you choose.'
			},
			{
				title: 'Add the roles',
				text: 'One row per role a member can pick, each with an emoji and a label.'
			},
			{
				title: 'Choose buttons or reactions',
				text: 'Buttons are clearer and cannot be removed by accident. Reactions look more familiar.'
			}
		],
		options: [
			{ name: 'Panel name', type: 'string', fallback: '—', text: 'Internal only.' },
			{
				name: 'Channel',
				type: 'channel',
				fallback: 'none',
				text: 'Where the panel message is posted.'
			},
			{
				name: 'Use buttons instead of reactions',
				type: 'boolean',
				fallback: 'on',
				text: 'Buttons are clearer and cannot be removed by accident.'
			},
			{
				name: 'Emoji',
				type: 'emoji',
				fallback: '—',
				text: 'Unicode or a custom emoji from this server.'
			},
			{ name: 'Label', type: 'string', fallback: '—', text: 'What the button says.' },
			{
				name: 'Role',
				type: 'role',
				fallback: '—',
				text: 'Granted on press, removed on a second press.'
			}
		]
	},
	{
		id: 'giveaways',
		title: 'Giveaways',
		summary: 'Timed draws with entry requirements, and a reroll when a winner goes quiet.',
		lead: 'A giveaway starts the moment you create it and draws when the timer runs out. Requirements are checked at draw time, not at entry time, so someone who loses the required role stops being eligible.',
		permissions: ['View Channel', 'Send Messages', 'Embed Links', 'Add Reactions'],
		steps: [
			{
				title: 'Describe the prize',
				text: 'It starts the moment you create it, so write it before you save.'
			},
			{
				title: 'Set the requirements',
				text: 'Required roles and a minimum level, both checked when the draw runs.'
			},
			{
				title: 'Draw, or reroll',
				text: 'A reroll excludes the previous winners and picks again from everyone still eligible.'
			}
		],
		options: [
			{ name: 'Prize', type: 'string', fallback: '—', text: 'Shown in the giveaway message.' },
			{
				name: 'Winners',
				type: 'number',
				fallback: '`1`',
				text: 'How many entries are drawn. Used when a new giveaway is created.'
			},
			{
				name: 'Runs for (hours)',
				type: 'number',
				fallback: '`24`',
				text: 'It starts the moment you create it.'
			},
			{
				name: 'Required roles',
				type: 'role[]',
				fallback: 'none',
				text: 'Checked at draw time, not at entry time.'
			},
			{
				name: 'Minimum level',
				type: 'number',
				fallback: '`0`',
				text: 'Needs the Levels module to be on.'
			},
			{
				name: 'DM the winners',
				type: 'boolean',
				fallback: 'on',
				text: 'Silently skipped if they have DMs from the server turned off. They also get pinged in the channel either way.'
			}
		]
	},
	{
		id: 'custom-commands',
		title: 'Custom commands',
		summary: 'Your own slash commands, no code.',
		lead: 'A custom command is a name, a response and who may run it. They are registered with Discord on save and appear alongside the built-in ones.',
		permissions: ['Use Application Commands', 'Send Messages', 'Embed Links'],
		steps: [
			{
				title: 'Name it',
				text: 'Registered with Discord on save. New names can take a minute to appear.'
			},
			{
				title: 'Write the response',
				text: 'Plain text or an embed, with the same variables the Welcome module uses.'
			},
			{
				title: 'Decide who may run it',
				text: 'Everyone, or a list of roles. A private reply is only seen by the caller.'
			}
		],
		options: [
			{
				name: 'Name',
				type: 'string',
				fallback: '—',
				text: 'Registered with Discord on save. New names can take a minute to appear.'
			},
			{
				name: 'Description',
				type: 'string',
				fallback: '—',
				text: 'What Discord shows in the command picker.'
			},
			{
				name: 'Response',
				type: 'string',
				fallback: '—',
				text: 'Plain text or an embed.'
			},
			{
				name: 'Who can use it',
				type: 'role[]',
				fallback: 'everyone',
				text: 'Empty means everyone who can use application commands.'
			},
			{
				name: 'Only the caller sees the reply',
				type: 'boolean',
				fallback: 'off',
				text: 'An ephemeral reply, which nobody else in the channel sees.'
			}
		],
		extra: [
			{
				kind: 'callout',
				tone: 'danger',
				title: 'A name collision silently wins',
				text: 'If a custom command takes the name of a built-in one, Discord keeps whichever was registered last. Rename rather than shadow.'
			}
		]
	},
	{
		id: 'scheduled',
		title: 'Scheduled messages',
		summary: 'Post on a timer, without anyone having to remember.',
		lead: 'A schedule is a message, a channel and a time. Every schedule runs in the server timezone, which is set once for the whole module rather than per message.',
		permissions: ['View Channel', 'Send Messages', 'Embed Links'],
		steps: [
			{
				title: 'Set the server timezone',
				text: 'Every schedule runs in the server timezone. Changing it moves every existing schedule with it.'
			},
			{
				title: 'Choose a kind',
				text: 'Once at a date and time, on a weekly repeat, or a cron expression for anything else.'
			},
			{
				title: 'Write the message',
				text: 'The same message editor the Welcome module uses, with a preview.'
			}
		],
		options: [
			{
				name: 'Server timezone',
				type: 'timezone',
				fallback: '`UTC`',
				text: 'Every schedule runs in the server timezone.'
			},
			{ name: 'Name', type: 'string', fallback: '—', text: 'Internal only.' },
			{ name: 'Channel', type: 'channel', fallback: 'none', text: 'Where the message is posted.' },
			{
				name: 'Schedule kind',
				type: 'once | weekly | cron',
				fallback: '`once`',
				text: 'Cron accepts a standard five-field expression.'
			},
			{
				name: 'When',
				type: 'date | weekday | cron',
				fallback: '—',
				text: 'What the kind asks for. The next three runs are previewed as you type.'
			}
		],
		extra: [
			{
				kind: 'callout',
				tone: 'warning',
				title: 'Scheduled is a Pro module',
				text: 'It is visible on every plan so you can see what it does, but saving its config needs Pro.'
			},
			{ kind: 'heading', id: 'cron', text: 'Cron expressions' },
			{
				kind: 'paragraph',
				text: 'Five fields, in the usual order. The dashboard previews the next three runs as you type, in the server timezone, so a wrong expression is obvious before you save.'
			},
			{
				kind: 'code',
				language: 'text',
				filename: 'cron',
				code: `┌── minute (0-59)
│ ┌── hour (0-23)
│ │ ┌── day of month (1-31)
│ │ │ ┌── month (1-12)
│ │ │ │ ┌── day of week (0-6, Sunday = 0)
│ │ │ │ │
0 9 * * 1    every Monday at 09:00 in the server timezone`
			}
		]
	}
];

function modulePage(doc: ModuleDoc): DocPage {
	return {
		slug: `modules/${doc.id}`,
		title: doc.title,
		summary: doc.summary,
		blocks: [
			{ kind: 'paragraph', text: doc.lead },
			{ kind: 'heading', id: 'setup', text: 'Setting it up' },
			{ kind: 'steps', items: doc.steps },
			{
				kind: 'callout',
				tone: 'info',
				title: 'Permissions this module needs',
				text: doc.permissions.map((permission) => `\`${permission}\``).join(', ')
			},
			{ kind: 'heading', id: 'options', text: 'Options' },
			{ kind: 'options', rows: doc.options },
			...(doc.extra ?? []),
			{ kind: 'heading', id: 'commands', text: 'Commands' },
			{ kind: 'commands', module: doc.id }
		]
	};
}

export const MODULE_PAGES: DocPage[] = MODULE_DOCS.map(modulePage);
