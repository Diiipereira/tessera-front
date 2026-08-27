'use client';

import { Check, CreditCard, Crown, Download, Infinity as InfinityIcon } from 'lucide-react';
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
import type { BillingCycle, BillingState, InvoiceStatus } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';

const INVOICE_LABELS: Record<InvoiceStatus, string> = {
	paid: 'Paid',
	open: 'Open',
	refunded: 'Refunded'
};

export function BillingScreen({ billing }: { billing: BillingState }) {
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
			<PageHeader
				title="Billing"
				description="What this server is on, what it is using, and what it has been charged."
			/>

			<div className="mt-6 flex flex-col gap-6">
				{billing.cancelAtPeriodEnd ? (
					<Alert variant="warning" title="This plan ends on the renewal date">
						{current.name} stays active until {dateOnly(billing.renewsAt)}, then the server drops to
						Free and anything over the Free limits stops running.
					</Alert>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
					<SettingsSection
						title={`${current.name} plan`}
						description={current.blurb}
						action={
							<Badge variant="primary" dot>
								Current
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
							{billing.cancelAtPeriodEnd ? 'Ends' : 'Renews'} {relativeTime(billing.renewsAt)} —{' '}
							{dateOnly(billing.renewsAt)}. {billing.daysLeftInPeriod} of {billing.daysInPeriod}{' '}
							days left in this period.
						</p>

						<div className="flex flex-wrap gap-2">
							<Button
								variant="outline"
								onClick={() => {
									toast.success('Opening the payment portal', {
										description: 'Card changes happen with the payment provider, not here.'
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

					<SettingsSection title="Usage" description="Against the limits of the current plan.">
						{billing.usage.map((usage) => {
							const limit = limitFor(current, usage.limitId);
							if (!limit) return null;

							if (limit.max === null || limit.kind === 'allowance') {
								return (
									<div key={usage.limitId} className="flex items-center justify-between gap-3">
										<span className="text-body-sm">{limit.label}</span>
										{limit.max === null ? (
											<span className="flex items-center gap-1.5 text-body-sm text-text-muted">
												<InfinityIcon className="size-4 text-success" aria-hidden="true" />
												<span className="sr-only">unlimited</span>
											</span>
										) : (
											<span className="tabular font-mono text-caption text-text-muted">
												{formatCount(limit.max)}
												{limit.unit ? ` ${limit.unit}` : ''}
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
									label={limit.label}
									valueLabel={`${formatCount(usage.value)} / ${formatCount(limit.max)}${limit.unit ? ` ${limit.unit}` : ''}`}
								/>
							);
						})}
					</SettingsSection>
				</div>

				<SettingsSection
					title="Plans"
					description="Changing mid-period is prorated to the day."
					action={
						<SegmentedControl
							options={[
								{ value: 'monthly', label: 'Monthly' },
								{ value: 'yearly', label: 'Yearly' }
							]}
							value={cycle}
							onValueChange={setCycle}
							label="Billing cycle"
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
											{isCurrent ? <Badge variant="primary">Current</Badge> : null}
										</div>
										<p className="mt-0.5 text-caption font-normal text-text-muted">{plan.blurb}</p>
									</div>

									<div className="flex items-baseline gap-1.5">
										<span className="text-h2">
											{formatPrice(monthlyEquivalentCents(plan, cycle))}
										</span>
										{plan.monthlyCents === 0 ? null : (
											<span className="text-caption font-normal text-text-muted">/month</span>
										)}
										{cycle === 'yearly' && savings > 0 ? (
											<Badge variant="success" className="ml-auto">
												save {savings}%
											</Badge>
										) : null}
									</div>

									<ul className="flex flex-col gap-1.5">
										{plan.features.map((feature) => (
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

				<SettingsSection title="Invoices" description="Every charge on this server.">
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
												{INVOICE_LABELS[invoice.status]}
											</Badge>
										</td>
										<td className="py-3">
											<Button
												variant="ghost"
												size="sm"
												iconOnly
												aria-label={`Download invoice ${invoice.number}`}
												onClick={() => {
													toast.success(`Invoice ${invoice.number}`, {
														description: 'The PDF comes from the payment provider.'
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
				description="Nothing is charged until you confirm."
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
								toast.success(`Now on ${target.name}`, {
									description:
										proration > 0
											? `${formatPrice(proration)} charged today.`
											: proration < 0
												? `${formatPrice(Math.abs(proration))} credited to the next invoice.`
												: 'Nothing to charge.'
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
								{ value: 'monthly', label: 'Monthly' },
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
							label="Billing cycle"
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
								label={proration >= 0 ? 'Charged today' : 'Credited'}
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
				description="The plan keeps running until the end of the period you already paid for."
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
								toast.success('Plan cancelled', {
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
