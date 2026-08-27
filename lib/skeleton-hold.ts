const DEFAULT_HOLD_MS = 3000;

export function skeletonHoldMs(): number {
	if (process.env.NODE_ENV !== 'development') return 0;

	const override = process.env.SKELETON_HOLD_MS;
	if (override === undefined || override === '') return DEFAULT_HOLD_MS;

	const parsed = Number.parseInt(override, 10);
	return Number.isNaN(parsed) ? DEFAULT_HOLD_MS : Math.max(parsed, 0);
}

export async function holdSkeleton(
	query: Record<string, string | string[] | undefined>
): Promise<void> {
	if (query.state === 'loading') return;

	const ms = skeletonHoldMs();
	if (ms === 0) return;

	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
