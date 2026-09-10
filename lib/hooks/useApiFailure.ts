'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { isKnownCode, type ApiFailure } from '@/lib/api-errors';

export type FailureText = (failure: ApiFailure) => string;

export function useApiFailure(): FailureText {
	const t = useTranslations('errors');

	return useCallback(
		(failure: ApiFailure): string => {
			if (!isKnownCode(failure.code)) return failure.fallback;

			const sentence = t(failure.code);
			const fields = failure.fields ?? [];

			return fields.length === 0
				? sentence
				: `${sentence} ${t('fields', { list: fields.join(', ') })}`;
		},
		[t]
	);
}
