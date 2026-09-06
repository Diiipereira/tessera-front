export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
	const next = [...items];
	const moved = next[from];

	if (moved === undefined || to < 0 || to >= next.length) return next;

	next.splice(from, 1);
	next.splice(to, 0, moved);

	return next;
}
