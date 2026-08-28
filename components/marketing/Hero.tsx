import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { BRAND } from '@/lib/brand';
import { TRUST_STATS } from '@/lib/marketing';
import { cn } from '@/lib/utils/cn';
import { HeroActions } from './HeroActions';

const stars = [
	{
		id: 'a',
		top: '18%',
		left: '9%',
		size: 'size-0.75',
		color: 'bg-brand-200',
		duration: '7s',
		delay: '0s'
	},
	{
		id: 'b',
		top: '34%',
		left: '31%',
		size: 'size-0.5',
		color: 'bg-brand-300',
		duration: '9s',
		delay: '1.2s'
	},
	{
		id: 'c',
		top: '62%',
		left: '14%',
		size: 'size-0.5',
		color: 'bg-brand-400',
		duration: '11s',
		delay: '0.6s'
	},
	{
		id: 'd',
		top: '26%',
		left: '54%',
		size: 'size-0.5',
		color: 'bg-brand-100',
		duration: '12s',
		delay: '0.3s'
	}
];

type HeroProps = {
	card: ReactNode;
	cardFirst?: boolean;
};

export function Hero({ card, cardFirst = false }: HeroProps) {
	const t = useTranslations('marketing.hero');
	const trust = useTranslations('marketing.trust');
	const copyOrder = cardFirst ? 'order-2 lg:order-1' : '';
	const cardOrder = cardFirst ? 'order-1 lg:order-2' : '';

	return (
		<section id="top" className="relative overflow-hidden border-b border-border">
			<div className="absolute inset-0 brand-mesh" aria-hidden="true" />

			{stars.map((star) => (
				<span
					key={star.id}
					aria-hidden="true"
					className={cn('absolute animate-drift rounded-full', star.size, star.color)}
					style={{
						top: star.top,
						left: star.left,
						animationDuration: star.duration,
						animationDelay: star.delay
					}}
				/>
			))}

			<div className="relative mx-auto grid max-w-300 items-start gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_400px]">
				<div className={cn('min-w-0', copyOrder)}>
					<span className="mb-6 inline-flex h-7 items-center gap-2 rounded-full border border-border bg-surface px-3 text-caption text-text-muted">
						<Sparkles className="size-3.5 text-primary" aria-hidden="true" />
						{t('eyebrow')}
					</span>

					<h1 className="max-w-[20ch] text-display-sm text-pretty lg:text-display">{t('title')}</h1>

					<p className="mt-5 max-w-[56ch] text-body-lg text-pretty text-text-muted">
						{t('lead', { brand: BRAND.name })}
					</p>

					<HeroActions />

					<div className="mt-8 flex flex-wrap gap-x-8 gap-y-6 border-t border-border pt-6">
						{TRUST_STATS.map((stat) => (
							<div key={stat.id} className="min-w-0">
								<p className="tabular text-h2">{stat.value}</p>
								<p className="text-body-sm text-text-muted">{trust(stat.id)}</p>
							</div>
						))}
					</div>
				</div>

				<div id="signin" className={cn('min-w-0 scroll-mt-22', cardOrder)}>
					{card}
				</div>
			</div>
		</section>
	);
}
