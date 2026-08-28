'use client';

import { Check, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { PublicFooter } from '@/components/marketing/PublicFooter';
import { PublicHeader } from '@/components/marketing/PublicHeader';
import { Section, SectionIntro } from '@/components/marketing/Section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
	PLANS,
	findPlan,
	formatPrice,
	limitFor,
	monthlyEquivalentCents,
	yearlySavingsPercent,
	type PlanDefinition
} from '@/lib/billing';
import { BRAND } from '@/lib/brand';
import { INVITE_HREF } from '@/lib/discord-invite';
import type { BillingCycle } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';

const LIMIT_ROWS = findPlan('free').limits.map((limit) => ({
	id: limit.id,
	label: limit.label,
	unit: limit.unit
}));

export function PricingScreen() {
	const t = useTranslations('pricing');
	const [cycle, setCycle] = useState<BillingCycle>('monthly');
	const savings = yearlySavingsPercent(findPlan('pro'));

	function priceNote(plan: PlanDefinition): string {
		if (plan.monthlyCents === 0) return t('forever');
		if (cycle === 'yearly') return t('perMonthYearly', { price: formatPrice(plan.yearlyCents) });
		return t('perMonth');
	}

	function limitValue(plan: PlanDefinition, limitId: string, unit: string | undefined): string {
		const limit = limitFor(plan, limitId);
		if (!limit) return t('absent');
		if (limit.max === null) return t('unlimited');
		if (limit.max === 0) return t('notIncluded');
		return unit === undefined ? String(limit.max) : `${String(limit.max)} ${unit}`;
	}

	return (
		<div className="min-h-svh bg-bg">
			<PublicHeader />

			<main>
				<Section>
					<div className="flex flex-wrap items-end justify-between gap-6">
						<SectionIntro overline={t('overline')} title={t('title')} lead={t('lead')} />
						<div className="flex items-center gap-3">
							<SegmentedControl
								label={t('cycle')}
								value={cycle}
								onValueChange={setCycle}
								options={[
									{ value: 'monthly', label: t('monthly') },
									{ value: 'yearly', label: t('yearly') }
								]}
							/>
							<Badge variant="success">{t('save', { percent: savings })}</Badge>
						</div>
					</div>

					<div className="mt-12 grid gap-4 lg:grid-cols-3">
						{PLANS.map((plan) => {
							const popular = plan.tier === 'pro';
							return (
								<div
									key={plan.tier}
									className={cn(
										'flex flex-col gap-5 rounded-2xl border bg-surface p-6 shadow-1',
										popular ? 'border-primary' : 'border-border'
									)}
								>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-h4">{plan.name}</h3>
											{popular ? <Badge variant="primary">{t('popular')}</Badge> : null}
										</div>
										<p className="mt-1 text-body-sm text-pretty text-text-muted">{plan.blurb}</p>
									</div>

									<div>
										<p className="tabular text-display-sm">
											{formatPrice(monthlyEquivalentCents(plan, cycle))}
										</p>
										<p className="mt-1 text-body-sm text-text-muted">{priceNote(plan)}</p>
									</div>

									{plan.monthlyCents === 0 ? (
										<Button variant="outline" href={INVITE_HREF} rel="external">
											<Plus aria-hidden="true" />
											{t('invite', { brand: BRAND.name })}
										</Button>
									) : (
										<Button variant={popular ? 'primary' : 'outline'} href="/login">
											{t('start', { plan: plan.name })}
										</Button>
									)}

									<ul className="flex flex-col gap-2.5">
										{plan.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2.5">
												<span className="mt-0.75 grid size-5 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
													<Check className="size-3 stroke-[2.5]" aria-hidden="true" />
												</span>
												<span className="text-body text-pretty text-text-muted">{feature}</span>
											</li>
										))}
									</ul>
								</div>
							);
						})}
					</div>
				</Section>

				<Section subtle>
					<SectionIntro overline={t('limitsOverline')} title={t('limitsTitle')} className="mb-12" />

					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse text-left">
							<thead>
								<tr className="border-b border-border">
									<th scope="col" className="py-3 pr-4 text-body-sm font-medium text-text-muted">
										{t('limit')}
									</th>
									{PLANS.map((plan) => (
										<th
											key={plan.tier}
											scope="col"
											className="py-3 pr-4 text-body-sm font-medium text-text-muted"
										>
											{plan.name}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{LIMIT_ROWS.map((row) => (
									<tr key={row.id} className="border-b border-border">
										<th scope="row" className="py-3 pr-4 text-body font-medium">
											{row.label}
										</th>
										{PLANS.map((plan) => (
											<td key={plan.tier} className="tabular py-3 pr-4 text-body text-text-muted">
												{limitValue(plan, row.id, row.unit)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Section>

				<ClosingCta />
			</main>

			<PublicFooter />
		</div>
	);
}
