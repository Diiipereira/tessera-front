import { COMMAND_CATEGORIES, cooldownLabel } from '@/lib/commands';
import type { DocBlock, DocPage } from '@/lib/docs/types';
import { mockCommands } from '@/lib/mock';
import type { BotCommand } from '@/lib/types/management';
import type { ModuleId } from '@/lib/types/modules';

export function commandsForModule(module: ModuleId): BotCommand[] {
	return mockCommands.filter((command) => command.module === module);
}

function categoryId(category: string): string {
	return category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const categoryBlocks: DocBlock[] = COMMAND_CATEGORIES.flatMap<DocBlock>((category) => {
	const commands = mockCommands.filter((command) => command.category === category);
	if (commands.length === 0) return [];

	return [
		{ kind: 'heading', id: categoryId(category), text: category },
		{
			kind: 'table',
			head: ['Command', 'What it does', 'Cooldown'],
			rows: commands.map((command) => [
				`\`/${command.name}\``,
				command.description,
				cooldownLabel(command.cooldownSeconds)
			])
		}
	];
});

export const COMMANDS_PAGE: DocPage = {
	slug: 'commands',
	title: 'Command reference',
	summary: 'Every slash command, what it does, and how often it can be run.',
	blocks: [
		{
			kind: 'paragraph',
			text: `Tessera registers ${String(mockCommands.length)} slash commands, grouped by the module they belong to. A command only works when its module is on, and every one of them can be turned off, restricted to roles, or blocked in specific channels from the **Commands** page in the dashboard.`
		},
		{
			kind: 'callout',
			tone: 'info',
			title: 'Cooldowns are per member, per server',
			text: 'A cooldown of `30s` means one member may run that command once every thirty seconds. It does not slow anyone else down.'
		},
		...categoryBlocks,
		{ kind: 'heading', id: 'restricting', text: 'Restricting a command' },
		{
			kind: 'paragraph',
			text: 'The dashboard’s **Commands** page carries the switch, the allowed roles and the blocked channels for every command at once. Restrictions are checked before the command runs, so a blocked command is refused rather than half-executed.'
		},
		{
			kind: 'table',
			head: ['Setting', 'Effect'],
			rows: [
				['Off', 'The command is not registered with Discord at all'],
				['Allowed roles', 'Empty means everyone; otherwise only those roles'],
				['Blocked channels', 'The command is refused in these, wherever the roles allow it'],
				['Cooldown', 'Per member, per server, counted from the last successful run']
			]
		}
	]
};
