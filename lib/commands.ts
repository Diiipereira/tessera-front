const NAME_PATTERN = /^[a-z0-9_-]{1,32}$/;

export type CommandNameIssue = 'empty' | 'shape' | 'taken';

export function commandNameIssue(name: string, taken: string[]): CommandNameIssue | undefined {
	if (name === '') return 'empty';
	if (!NAME_PATTERN.test(name)) return 'shape';
	if (taken.includes(name)) return 'taken';
	return undefined;
}
