import type { MessageVariable } from '@/lib/types/modules';

export function renderVariables(text: string, variables: MessageVariable[]): string {
	return variables.reduce(
		(rendered, variable) => rendered.split(variable.token).join(variable.sample),
		text
	);
}

export function usedVariables(text: string, variables: MessageVariable[]): MessageVariable[] {
	return variables.filter((variable) => text.includes(variable.token));
}

export function unknownVariables(text: string, variables: MessageVariable[]): string[] {
	const known = new Set(variables.map((variable) => variable.token));
	const found = text.match(/\{[a-zA-Z][a-zA-Z0-9._]*\}/g) ?? [];
	return [...new Set(found.filter((token) => !known.has(token)))];
}

export function insertAtCursor(
	text: string,
	token: string,
	selectionStart: number,
	selectionEnd: number
): { text: string; cursor: number } {
	const before = text.slice(0, selectionStart);
	const after = text.slice(selectionEnd);
	const needsSpaceBefore = before.length > 0 && !/\s$/.test(before);
	const prefix = needsSpaceBefore ? ' ' : '';

	return {
		text: `${before}${prefix}${token}${after}`,
		cursor: selectionStart + prefix.length + token.length
	};
}
