'use client';

import { useFormatter, useTranslations } from 'next-intl';

export const JUST_NOW_MS = 45_000;

export type RelativeTime = (iso: string | null, now: Date) => string;

export function useRelativeTime(): RelativeTime {
	const format = useFormatter();
	const t = useTranslations('common');

	return (iso, now) => {
		if (iso === null) return t('unknownTime');

		const at = new Date(iso);

		if (Number.isNaN(at.getTime())) return t('unknownTime');
		if (Math.abs(now.getTime() - at.getTime()) < JUST_NOW_MS) return t('justNow');

		return format.relativeTime(at, now);
	};
}
