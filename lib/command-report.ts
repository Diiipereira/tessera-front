export const USAGE_WINDOWS = [7, 30, 90] as const;

export type UsageWindow = (typeof USAGE_WINDOWS)[number];

export const DEFAULT_USAGE_WINDOW: UsageWindow = 7;

export type CommandUseDto = {
	name: string;
	uses: number;
	failures: number;
	lastUsedAt: string | null;
};

export type CommandDto = CommandUseDto & {
	module: string | null;
	subcommands: CommandUseDto[];
};

export type CommandReportDto = {
	since: string;
	until: string;
	commands: CommandDto[];
};

export type CommandFilters = {
	query: string;
	module: string;
	onlyUsed: boolean;
};

export const blankCommandFilters: CommandFilters = {
	query: '',
	module: 'all',
	onlyUsed: false
};

export const isUsageWindow = (value: number): value is UsageWindow =>
	USAGE_WINDOWS.some((window) => window === value);

export function filterCommands(
	commands: readonly CommandDto[],
	filters: CommandFilters
): CommandDto[] {
	const term = filters.query.trim().toLowerCase().replace(/^\//, '');

	return commands.filter((command) => {
		if (filters.module !== 'all' && command.module !== filters.module) return false;
		if (filters.onlyUsed && command.uses === 0) return false;
		if (term === '') return true;

		return (
			command.name.toLowerCase().includes(term) ||
			command.subcommands.some((one) => one.name.toLowerCase().includes(term))
		);
	});
}

export const modulesIn = (commands: readonly CommandDto[]): string[] => [
	...new Set(commands.flatMap((command) => (command.module === null ? [] : [command.module])))
];

export const moduleCounts = (commands: readonly CommandDto[]): Record<string, number> => {
	const counts: Record<string, number> = {};

	for (const command of commands) {
		if (command.module === null) continue;

		counts[command.module] = (counts[command.module] ?? 0) + 1;
	}

	return counts;
};

export const totalUses = (commands: readonly CommandDto[]): number =>
	commands.reduce((total, command) => total + command.uses, 0);

export const usedCount = (commands: readonly CommandDto[]): number =>
	commands.filter((command) => command.uses > 0).length;

export function failureRate(command: CommandUseDto): number | null {
	if (command.uses === 0) return null;

	return Math.round((command.failures / command.uses) * 100);
}

export const byUses = (left: CommandDto, right: CommandDto): number =>
	right.uses - left.uses || left.name.localeCompare(right.name);

export const windowParams = (days: UsageWindow): URLSearchParams =>
	new URLSearchParams({ days: String(days) });
