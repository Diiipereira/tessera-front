export type TimezoneOption = {
	value: string;
	label: string;
	search: string;
};

function offsetOf(zone: string, now: Date): string {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: zone,
		timeZoneName: 'shortOffset'
	}).formatToParts(now);

	return parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
}

export function zoneLabel(zone: string, now: Date = new Date()): string {
	try {
		return `${zone.replaceAll('_', ' ')} (${offsetOf(zone, now)})`;
	} catch {
		return zone;
	}
}

const ALWAYS_OFFERED = ['UTC'];

export function timezoneOptions(now: Date = new Date()): TimezoneOption[] {
	const listed = Intl.supportedValuesOf('timeZone');
	const missing = ALWAYS_OFFERED.filter((zone) => !listed.includes(zone));

	return [...missing, ...listed].map((zone) => {
		const label = zoneLabel(zone, now);

		return { value: zone, label, search: `${zone} ${label}`.toLowerCase() };
	});
}
