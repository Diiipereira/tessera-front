'use client';

import { PlugZap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

export default function AuthenticatedError({
	error,
	retry
}: {
	error: Error & { digest?: string };
	retry: () => void;
}) {
	const t = useTranslations('failure');

	return (
		<div className="w-full p-6 sm:p-8">
			<EmptyState
				icon={PlugZap}
				title={t('title')}
				description={t('body')}
				action={<Button onClick={retry}>{t('retry')}</Button>}
			/>

			{error.digest === undefined ? null : (
				<p className="mt-4 text-center font-mono text-caption font-normal text-text-subtle">
					{t('reference', { digest: error.digest })}
				</p>
			)}

			{IN_DEVELOPMENT ? (
				<pre className="mx-auto mt-6 max-w-2xl overflow-x-auto rounded-md bg-surface-sunken p-4 text-caption font-normal text-text-muted">
					{error.message}
				</pre>
			) : null}
		</div>
	);
}
