import { ArrowUpRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HELP_CARDS, type HelpCard } from '@/lib/marketing';
import { cn } from '@/lib/utils/cn';
import { Section, SectionIntro } from './Section';

const cardClass =
	'flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 text-text no-underline shadow-1 transition-colors duration-120 ease-out hover:border-border-strong hover:no-underline';

function CardShell({ card, children }: { card: HelpCard; children: ReactNode }) {
	if (card.external) {
		return (
			<a href={card.href} rel="external" className={cardClass}>
				{children}
			</a>
		);
	}

	return (
		<Link href={card.href} className={cardClass}>
			{children}
		</Link>
	);
}

export function HelpCards() {
	return (
		<Section id="support">
			<SectionIntro
				overline="Docs & support"
				title="Help before you need it, and a human when you do"
				lead="Every module page links straight to its own docs page. If something is genuinely broken, the support server is the fastest route."
				className="mb-12"
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{HELP_CARDS.map((card) => {
					const Icon = card.icon;
					const Arrow = card.external ? ExternalLink : ArrowUpRight;

					return (
						<CardShell key={card.id} card={card}>
							<div className="flex items-center gap-3">
								<span
									className={cn('grid size-10 shrink-0 place-items-center rounded-lg', card.tile)}
								>
									<Icon className="size-5" aria-hidden="true" />
								</span>
								<span className="min-w-0 flex-1 text-h4">{card.title}</span>
								<Arrow className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
							</div>
							<p className="text-body text-pretty text-text-muted">{card.body}</p>
							<span className="font-mono text-caption font-normal text-text-muted">
								{card.meta}
							</span>
						</CardShell>
					);
				})}
			</div>
		</Section>
	);
}
