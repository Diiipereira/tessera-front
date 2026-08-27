import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BRAND } from '@/lib/brand';

export function BotOfflineBanner() {
	const t = useTranslations('shell');

	return (
		<div
			role="alert"
			className="flex shrink-0 flex-wrap items-center gap-2.5 border-b border-danger bg-danger-subtle px-4 py-2.5 text-danger-fg sm:px-6"
		>
			<TriangleAlert className="size-4 shrink-0 text-danger" aria-hidden="true" />
			<span className="text-body font-medium">{t('offline', { bot: BRAND.botName })}</span>
			<span className="text-body opacity-85">{t('offlineHint')}</span>
			<div className="flex-1" />
			<a
				href={BRAND.supportUrl}
				rel="external"
				className="text-body-sm font-medium text-danger-fg hover:underline"
			>
				{t('statusPage')}
			</a>
		</div>
	);
}
