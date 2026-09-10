'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { isKnownCode, type ApiFailure } from '@/lib/api-errors';
import { ConfigSaveError } from '@/lib/hooks/useConfigDraft';

export type FailureText = (failure: ApiFailure) => string;

export type ThrownText = (error: unknown) => string;

const BROKE_ON_OUR_SIDE: ApiFailure = { code: 'INTERNAL_ERROR', fallback: 'Unexpected failure' };

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

export function useThrownFailure(): ThrownText {
	const describe = useApiFailure();

	return useCallback(
		(error: unknown): string =>
			describe(error instanceof ConfigSaveError ? error.failure : BROKE_ON_OUR_SIDE),
		[describe]
	);
}
