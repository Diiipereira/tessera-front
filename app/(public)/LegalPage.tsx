import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';

export function LegalPage({ document }: { document: 'terms' | 'privacy' }) {
	const t = useTranslations('legal');

	return (
		<div className="mx-auto flex min-h-svh max-w-180 flex-col gap-6 px-6 py-16">
			<h1 className="text-h1">{t(document)}</h1>
			<p className="text-body-lg text-pretty text-text-muted">{t('body', { brand: BRAND.name })}</p>
			<div>
				<Button variant="outline" href="/login">
					{t('back')}
				</Button>
			</div>
		</div>
	);
}
