export type CurvePoint = {
	level: number;
	totalXp: number;
	xpFromPrevious: number;
};

export function totalXpForLevel(level: number, curve: number): number {
	if (level <= 0) return 0;
	return Math.round(curve * level * level);
}

export function buildCurve(maxLevel: number, curve: number): CurvePoint[] {
	const points: CurvePoint[] = [];
	for (let level = 1; level <= maxLevel; level += 1) {
		const totalXp = totalXpForLevel(level, curve);
		points.push({
			level,
			totalXp,
			xpFromPrevious: totalXp - totalXpForLevel(level - 1, curve)
		});
	}
	return points;
}

export function messagesToReach(
	level: number,
	curve: number,
	xpMin: number,
	xpMax: number
): number {
	const average = (xpMin + xpMax) / 2;
	if (average <= 0) return 0;
	return Math.ceil(totalXpForLevel(level, curve) / average);
}

export function estimateTimeToLevel(
	level: number,
	curve: number,
	xpMin: number,
	xpMax: number,
	cooldownSeconds: number
): string {
	const messages = messagesToReach(level, curve, xpMin, xpMax);
	const seconds = messages * Math.max(cooldownSeconds, 1);
	const hours = seconds / 3600;

	if (hours < 1) return `${String(Math.max(1, Math.round(seconds / 60)))} min of chatting`;
	if (hours < 48) return `${String(Math.round(hours))} h of chatting`;
	return `${String(Math.round(hours / 24))} days of chatting`;
}
