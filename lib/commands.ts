import type { Channel, Role } from '@/lib/types/discord';
import type { BotCommand, CommandCategory } from '@/lib/types/management';

export const COMMAND_CATEGORIES: CommandCategory[] = [
	'Moderation',
	'Levels',
	'Economy',
	'Tickets',
	'Community',
	'Utility'
];

export function cooldownLabel(seconds: number): string {
	if (seconds <= 0) return 'None';
	if (seconds < 60) return `${String(seconds)}s`;
	if (seconds < 3600) {
		const minutes = seconds / 60;
		return Number.isInteger(minutes) ? `${String(minutes)}m` : `${minutes.toFixed(1)}m`;
	}
	const hours = seconds / 3600;
	return Number.isInteger(hours) ? `${String(hours)}h` : `${hours.toFixed(1)}h`;
}

export function restrictionSummary(
	command: BotCommand,
	roles: Role[],
	channels: Channel[]
): string {
	const allowed = command.allowedRoleIds
		.map((id) => roles.find((role) => role.id === id)?.name)
		.filter((name): name is string => name !== undefined);

	const denied = command.deniedChannelIds
		.map((id) => channels.find((channel) => channel.id === id)?.name)
		.filter((name): name is string => name !== undefined);

	if (allowed.length === 0 && denied.length === 0) return 'Everyone, everywhere';

	const parts: string[] = [];
	if (allowed.length > 0)
		parts.push(allowed.length === 1 ? (allowed[0] ?? '') : `${String(allowed.length)} roles`);
	else parts.push('Everyone');
	if (denied.length > 0)
		parts.push(`except ${String(denied.length)} channel${denied.length === 1 ? '' : 's'}`);

	return parts.join(', ');
}

export type CommandFilters = {
	query: string;
	category: CommandCategory | 'all';
	onlyDisabled: boolean;
};

export function filterCommands(commands: BotCommand[], filters: CommandFilters): BotCommand[] {
	const term = filters.query.trim().toLowerCase().replace(/^\//, '');

	return commands.filter((command) => {
		if (filters.category !== 'all' && command.category !== filters.category) return false;
		if (filters.onlyDisabled && command.enabled) return false;
		if (term === '') return true;
		return (
			command.name.toLowerCase().includes(term) || command.description.toLowerCase().includes(term)
		);
	});
}

export function categoryCounts(commands: BotCommand[]): Record<CommandCategory, number> {
	const counts = {
		Moderation: 0,
		Levels: 0,
		Economy: 0,
		Tickets: 0,
		Community: 0,
		Utility: 0
	} satisfies Record<CommandCategory, number>;

	for (const command of commands) counts[command.category] += 1;
	return counts;
}

const NAME_PATTERN = /^[a-z0-9_-]{1,32}$/;

export function commandNameError(name: string, taken: string[]): string | undefined {
	if (name === '') return 'A command needs a name.';
	if (!NAME_PATTERN.test(name)) {
		return 'Lowercase letters, numbers, dashes and underscores only, up to 32 characters.';
	}
	if (taken.includes(name)) return 'Another command already uses that name.';
	return undefined;
}
