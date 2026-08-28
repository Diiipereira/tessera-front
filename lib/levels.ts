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

export type ChatEffort = { unit: 'minutes' | 'hours' | 'days'; amount: number };

export function effortToLevel(
	level: number,
	curve: number,
	xpMin: number,
	xpMax: number,
	cooldownSeconds: number
): ChatEffort {
	const messages = messagesToReach(level, curve, xpMin, xpMax);
	const seconds = messages * Math.max(cooldownSeconds, 1);
	const hours = seconds / 3600;

	if (hours < 1) return { unit: 'minutes', amount: Math.max(1, Math.round(seconds / 60)) };
	if (hours < 48) return { unit: 'hours', amount: Math.round(hours) };
	return { unit: 'days', amount: Math.round(hours / 24) };
}
