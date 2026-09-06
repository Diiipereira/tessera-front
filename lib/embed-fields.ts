import type { EmbedField } from '@/lib/types/modules';

export const MAX_INLINE_PER_ROW = 3;

export function toFieldRows(fields: readonly EmbedField[]): EmbedField[][] {
	const rows: EmbedField[][] = [];

	for (const field of fields) {
		const open = rows.at(-1);

		if (
			field.inline &&
			open !== undefined &&
			open.length < MAX_INLINE_PER_ROW &&
			open[0]?.inline === true
		) {
			open.push(field);
			continue;
		}

		rows.push([field]);
	}

	return rows;
}
