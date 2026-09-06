'use client';

import { useTranslations } from 'next-intl';
import { BRAND } from '@/lib/brand';
import type { LockedReason } from '@/lib/types/discord';

export function useLockReason(): (reason: LockedReason) => string {
	const t = useTranslations('pickers.locked');

	return (reason) => {
		if (reason === 'managed') return t('managed');
		if (reason === 'aboveBot') return t('aboveBot', { brand: BRAND.name });

		return t('noAccess', { brand: BRAND.name });
	};
}
