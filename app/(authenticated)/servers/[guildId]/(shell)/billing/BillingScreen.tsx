'use client';

import { Check, CreditCard, Crown, Download, Infinity as InfinityIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/management/PageHeader';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Meter } from '@/components/ui/Meter';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
	cycleTotalCents,
	findPlan,
	formatPrice,
	limitFor,
	monthlyEquivalentCents,
	prorationCents,
	PLANS,
	yearlySavingsPercent,
	type PlanDefinition
} from '@/lib/billing';
import { dateOnly, relativeTime } from '@/lib/time';
import type { PlanTier } from '@/lib/types/billing';
import type { BillingCycle, BillingState } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';

export function BillingScreen({ billing }: { billing: BillingState }) {
	const t = useTranslations('billing');

	const featuresOf = (plan: PlanTier): string[] =>
		Object.values(t.raw(`plan.${plan}.features`) as Record<string, string>);
	const [tier, setTier] = useState<PlanTier>(billing.tier);
	const [cycle, setCycle] = useState<BillingCycle>(billing.cycle);
	const [target, setTarget] = useState<PlanDefinition | null>(null);
	const [cancelling, setCancelling] = useState(false);

	const current = findPlan(tier);
	const proration =
		target === null
			? 0
			: prorationCents(current, target, cycle, billing.daysLeftInPeriod, billing.daysInPeriod);

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader title={t('title')} description={t('description')} />

			<div className="mt-6 flex flex-col gap-6">
				{billing.cancelAtPeriodEnd ? (
					<Alert variant="warning" title={t('endingTitle')}>
						{current.name} stays active until {dateOnly(billing.renewsAt)}, then the server drops to
						Free and anything over the Free limits stops running.
					</Alert>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
					<SettingsSection
						title={t('currentPlan', { plan: current.name })}
						description={t(`plan.${current.tier}.blurb`)}
						action={
							<Badge variant="primary" dot>
								{t('plans.current')}
							</Badge>
						}
					>
						<div className="flex flex-wrap items-baseline gap-2">
							<span className="text-h1">{formatPrice(monthlyEquivalentCents(current, cycle))}</span>
							{current.monthlyCents === 0 ? null : (
								<span className="text-body text-text-muted">
									per month{cycle === 'yearly' ? ', billed yearly' : ''}
								</span>
							)}
						</div>

						<p className="text-body-sm text-text-muted">
							{billing.cancelAtPeriodEnd ? t('ends') : t('renews')} {relativeTime(billing.renewsAt)}{' '}
							— {dateOnly(billing.renewsAt)}. {billing.daysLeftInPeriod} of {billing.daysInPeriod}{' '}
							days left in this period.
						</p>

						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								onClick={() => {
									toast.success(t('portal'), {
										description: t('portalHint')
									});
								}}
							>
								<CreditCard aria-hidden="true" />
								Manage payment
							</Button>
							<Button
								variant="ghost-danger"
								disabled={tier === 'free'}
								onClick={() => {
									setCancelling(true);
								}}
							>
								Cancel plan
							</Button>
						</div>

						{billing.paymentMethod ? (
							<p className="text-caption font-normal text-text-muted">
								{billing.paymentMethod.brand} ending {billing.paymentMethod.last4}, expires{' '}
								{billing.paymentMethod.expiry}.
							</p>
						) : (
							<p className="text-caption font-normal text-warning-fg">No payment method on file.</p>
						)}
					</SettingsSection>

					<SettingsSection title={t('usage.title')} description={t('usage.description')}>
						{billing.usage.map((usage) => {
							const limit = limitFor(current, usage.limitId);
							if (!limit) return null;

							if (limit.max === null || limit.kind === 'allowance') {
								return (
									<div key={usage.limitId} className="flex items-center justify-between gap-3">
										<span className="text-body-sm">{t(`limit.${limit.id}`)}</span>
										{limit.max === null ? (
											<span className="flex items-center gap-1.5 text-body-sm text-text-muted">
												<InfinityIcon className="size-4 text-success" aria-hidden="true" />
												<span className="sr-only">{t('unlimited')}</span>
											</span>
										) : (
											<span className="tabular font-mono text-caption text-text-muted">
												{formatCount(limit.max)}
												{limit.unit ? ` ${t(`unit.${limit.unit}`)}` : ''}
											</span>
										)}
									</div>
								);
							}

							return (
								<Meter
									key={usage.limitId}
									value={usage.value}
									max={limit.max}
									label={t(`limit.${limit.id}`)}
									valueLabel={`${formatCount(usage.value)} / ${formatCount(limit.max)}${limit.unit ? ` ${t(`unit.${limit.unit}`)}` : ''}`}
								/>
							);
						})}
					</SettingsSection>
				</div>

				<SettingsSection
					title={t('plans.title')}
					description={t('plans.description')}
					action={
						<SegmentedControl
							options={[
								{ value: 'monthly', label: t('plans.monthly') },
								{ value: 'yearly', label: t('plans.yearly') }
							]}
							value={cycle}
							onValueChange={setCycle}
							label={t('plans.cycle')}
							size="sm"
						/>
					}
				>
					<div className="grid gap-4 lg:grid-cols-3">
						{PLANS.map((plan) => {
							const isCurrent = plan.tier === tier;
							const isUpgrade = plan.monthlyCents > current.monthlyCents;
							const savings = yearlySavingsPercent(plan);

							return (
								<div
									key={plan.tier}
									className={cn(
										'flex flex-col gap-4 rounded-lg border p-4',
										isCurrent ? 'border-primary bg-primary-subtle/30' : 'border-border bg-surface'
									)}
								>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-h4">{plan.name}</h3>
											{plan.tier === 'ultimate' ? (
												<Crown className="size-4 text-warning" aria-hidden="true" />
											) : null}
											{isCurrent ? <Badge variant="primary">{t('plans.current')}</Badge> : null}
										</div>
										<p className="mt-0.5 text-caption font-normal text-text-muted">
											{t(`plan.${plan.tier}.blurb`)}
										</p>
									</div>

									<div className="flex items-baseline gap-1.5">
										<span className="text-h2">
											{formatPrice(monthlyEquivalentCents(plan, cycle))}
										</span>
										{plan.monthlyCents === 0 ? null : (
											<span className="text-caption font-normal text-text-muted">
												{t('perMonth')}
											</span>
										)}
										{cycle === 'yearly' && savings > 0 ? (
											<Badge variant="success" className="ml-auto">
												{t('save', { percent: savings })}
											</Badge>
										) : null}
									</div>

									<ul className="flex flex-col gap-1.5">
										{featuresOf(plan.tier).map((feature) => (
											<li key={feature} className="flex items-start gap-2 text-body-sm">
												<Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
												<span className="text-text-muted">{feature}</span>
											</li>
										))}
									</ul>

									<Button
										variant={isCurrent ? 'ghost' : isUpgrade ? 'primary' : 'outline'}
										disabled={isCurrent}
										className="mt-auto"
										onClick={() => {
											setTarget(plan);
										}}
									>
										{isCurrent
											? 'You are here'
											: isUpgrade
												? `Upgrade to ${plan.name}`
												: `Move to ${plan.name}`}
									</Button>
								</div>
							);
						})}
					</div>
				</SettingsSection>

				<SettingsSection title={t('invoices.title')} description={t('invoices.description')}>
					<div className="overflow-x-auto">
						<table className="w-full min-w-140 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">Number</th>
									<th className="py-2 pr-4 font-mono font-semibold">Date</th>
									<th className="py-2 pr-4 font-mono font-semibold">Description</th>
									<th className="py-2 pr-4 text-right font-mono font-semibold">Amount</th>
									<th className="py-2 pr-4 font-mono font-semibold">Status</th>
									<th className="w-12 py-2 font-mono font-semibold" />
								</tr>
							</thead>
							<tbody>
								{billing.invoices.map((invoice) => (
									<tr key={invoice.id} className="border-b border-border last:border-0">
										<td className="py-3 pr-4 font-mono text-body-sm">{invoice.number}</td>
										<td className="py-3 pr-4 text-body-sm whitespace-nowrap text-text-muted">
											{dateOnly(invoice.at)}
										</td>
										<td className="py-3 pr-4 text-body-sm text-text-muted">
											{invoice.description}
										</td>
										<td className="tabular py-3 pr-4 text-right text-body-sm">
											{formatPrice(invoice.amountCents)}
										</td>
										<td className="py-3 pr-4">
											<Badge
												variant={
													invoice.status === 'paid'
														? 'success'
														: invoice.status === 'open'
															? 'warning'
															: 'neutral'
												}
											>
												{t(`status.${invoice.status}`)}
											</Badge>
										</td>
										<td className="py-3">
											<Button
												variant="ghost"
												size="sm"
												iconOnly
												aria-label={`Download invoice ${invoice.number}`}
												onClick={() => {
													toast.success(t('invoices.opened', { number: invoice.number }), {
														description: t('invoices.openedHint')
													});
												}}
											>
												<Download aria-hidden="true" />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</SettingsSection>
			</div>

			<Dialog
				open={target !== null}
				onOpenChange={(open) => {
					if (!open) setTarget(null);
				}}
				title={target === null ? '' : `Move to ${target.name}`}
				description={t('change.description')}
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => {
								setTarget(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (!target) return;
								setTier(target.tier);
								toast.success(t('change.now', { plan: target.name }), {
									description:
										proration > 0
											? `${formatPrice(proration)} charged today.`
											: proration < 0
												? `${formatPrice(Math.abs(proration))} credited to the next invoice.`
												: t('change.nothing')
								});
								setTarget(null);
							}}
						>
							Confirm
						</Button>
					</>
				}
			>
				{target === null ? null : (
					<div className="flex flex-col gap-4">
						<SegmentedControl
							options={[
								{ value: 'monthly', label: t('plans.monthly') },
								{
									value: 'yearly',
									label:
										yearlySavingsPercent(target) > 0
											? `Yearly · save ${String(yearlySavingsPercent(target))}%`
											: 'Yearly'
								}
							]}
							value={cycle}
							onValueChange={setCycle}
							label={t('plans.cycle')}
						/>

						<dl className="flex flex-col gap-2 rounded-md border border-border bg-surface-sunken p-3">
							<Row
								label={`${current.name} today`}
								value={formatPrice(cycleTotalCents(current, cycle))}
							/>
							<Row
								label={`${target.name} from now`}
								value={formatPrice(cycleTotalCents(target, cycle))}
							/>
							<Row
								label={proration >= 0 ? t('change.charged') : t('change.credited')}
								value={formatPrice(Math.abs(proration))}
								strong
							/>
						</dl>

						<p className="text-body-sm text-text-muted">
							{billing.daysLeftInPeriod} of {billing.daysInPeriod} days are left in this period, so
							you are {proration >= 0 ? 'charged' : 'credited'} that share of the difference. The
							full price applies from {dateOnly(billing.renewsAt)}.
						</p>
					</div>
				)}
			</Dialog>

			<Dialog
				open={cancelling}
				onOpenChange={setCancelling}
				title={`Cancel ${current.name}?`}
				danger
				description={t('cancel.description')}
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => {
								setCancelling(false);
							}}
						>
							Keep it
						</Button>
						<Button
							variant="danger"
							onClick={() => {
								setCancelling(false);
								toast.success(t('cancel.done'), {
									description: `It stays active until ${dateOnly(billing.renewsAt)}.`
								});
							}}
						>
							Cancel plan
						</Button>
					</>
				}
			>
				<p className="text-body text-text-muted">
					On {dateOnly(billing.renewsAt)} this server drops to Free. Anything above the Free limits
					stops: rules past the fifth, commands past the tenth, and every scheduled message.
				</p>
			</Dialog>
		</div>
	);
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<dt className={cn('text-body-sm', strong ? 'font-medium' : 'text-text-muted')}>{label}</dt>
			<dd className={cn('tabular text-body-sm', strong && 'font-semibold')}>{value}</dd>
		</div>
	);
}
