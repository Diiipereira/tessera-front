import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import { INVITE_HREF } from '@/lib/discord-invite';

export function ClosingCta() {
	const t = useTranslations('marketing.cta');

	return (
		<section className="border-b border-border">
			<div className="mx-auto max-w-300 px-6 py-20 sm:px-8">
				<div className="relative overflow-hidden rounded-2xl border border-border px-6 py-14 text-center sm:px-10">
					<div className="absolute inset-0 brand-mesh" aria-hidden="true" />

					<div className="relative">
						<h2 className="text-h1 text-pretty">{t('title', { brand: BRAND.name })}</h2>
						<p className="mx-auto mt-3 max-w-[52ch] text-body-lg text-pretty text-text-muted">
							{t('lead')}
						</p>
						<div className="mt-7 flex flex-wrap justify-center gap-3">
							<Button size="xl" href={INVITE_HREF} rel="external">
								<Plus aria-hidden="true" />
								{t('invite', { brand: BRAND.name })}
							</Button>
							<Button size="xl" variant="outline" href="/docs">
								{t('docs')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
