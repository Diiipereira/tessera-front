import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { OutboundLink } from '@/components/ui/OutboundLink';
import { HELP_CARDS, type HelpCard } from '@/lib/marketing';
import { cn } from '@/lib/utils/cn';
import { Section, SectionIntro } from './Section';

const cardClass =
	'flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 text-text no-underline shadow-1 transition-colors duration-120 ease-out hover:border-border-strong hover:no-underline';

function CardShell({ card, children }: { card: HelpCard; children: ReactNode }) {
	if (card.external) {
		return (
			<OutboundLink href={card.href} className={cardClass}>
				{children}
			</OutboundLink>
		);
	}

	return (
		<Link href={card.href} className={cardClass}>
			{children}
		</Link>
	);
}

export function HelpCards() {
	const t = useTranslations('marketing.help');
	const shared = useTranslations('common');

	return (
		<Section id="support">
			<SectionIntro
				overline={t('overline')}
				title={t('title')}
				lead={t('lead')}
				className="mb-12"
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{HELP_CARDS.map((card) => {
					const Icon = card.icon;
					const Arrow = card.external ? ExternalLink : ArrowUpRight;
					const reachable = !card.external || card.href !== null;

					return (
						<CardShell key={card.id} card={card}>
							<div className="flex items-center gap-3">
								<span
									className={cn('grid size-10 shrink-0 place-items-center rounded-lg', card.tile)}
								>
									<Icon className="size-5" aria-hidden="true" />
								</span>
								<span className="min-w-0 flex-1 text-h4">{t(`${card.id}.title`)}</span>
								<Arrow className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
							</div>
							<p className="text-body text-pretty text-text-muted">{t(`${card.id}.body`)}</p>
							{reachable ? (
								<span className="font-mono text-caption font-normal text-text-muted">
									{t(`${card.id}.meta`)}
								</span>
							) : (
								<Badge variant="neutral" className="self-start">
									{shared('notAvailable')}
								</Badge>
							)}
						</CardShell>
					);
				})}
			</div>
		</Section>
	);
}
