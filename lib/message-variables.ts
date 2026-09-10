import type { MessageVariable } from '@/lib/types/modules';

export function renderVariables(text: string, variables: MessageVariable[]): string {
	return variables.reduce(
		(rendered, variable) => rendered.split(variable.token).join(variable.sample),
		text
	);
}

export type MessageSegment = { text: string; variable: MessageVariable | null };

export function toSegments(text: string, variables: MessageVariable[]): MessageSegment[] {
	const segments: MessageSegment[] = [];
	let rest = text;

	while (rest !== '') {
		const found = variables
			.map((variable) => ({ variable, at: rest.indexOf(variable.token) }))
			.filter((hit) => hit.at >= 0)
			.sort((left, right) => left.at - right.at)
			.at(0);

		if (found === undefined) {
			segments.push({ text: rest, variable: null });
			break;
		}

		if (found.at > 0) {
			segments.push({ text: rest.slice(0, found.at), variable: null });
		}

		segments.push({ text: found.variable.sample, variable: found.variable });
		rest = rest.slice(found.at + found.variable.token.length);
	}

	return segments;
}

export function looksLikeMention(sample: string): boolean {
	return sample.startsWith('@') || sample.startsWith('#');
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
