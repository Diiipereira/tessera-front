'use client';

import { Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Avatar } from '@/components/layout/Avatar';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import {
	countByPlan,
	filterTenants,
	formatMembers,
	TENANT_SORT_LABELS,
	TENANT_SORTS,
	tenantStatus,
	toPlanFilter,
	toTenantSort,
	type TenantSort
} from '@/lib/admin';
import { dateOnly, relativeTime } from '@/lib/time';
import type { TenantStatus, TenantSummary } from '@/lib/types/admin';
import { BRAND } from '@/lib/brand';
import type { PlanTier } from '@/lib/types/billing';

const PLAN_VARIANTS: Record<PlanTier, BadgeVariant> = {
	free: 'neutral',
	pro: 'primary',
	ultimate: 'info'
};

const PLAN_LABELS: Record<PlanTier, string> = {
	free: 'Free',
	pro: 'Pro',
	ultimate: 'Ultimate'
};

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border bg-surface px-4 py-3 shadow-1">
			<p className="text-overline text-text-muted uppercase">{label}</p>
			<p className="tabular mt-1 text-h3">{value}</p>
		</div>
	);
}

export function TenantsScreen({ tenants }: { tenants: TenantSummary[] }) {
	const t = useTranslations('admin.tenants');
	const [query, setQuery] = useState('');
	const [status, setStatus] = useState<TenantStatus | 'all'>('active');
	const [plan, setPlan] = useState<PlanTier | 'all'>('all');
	const [sort, setSort] = useState<TenantSort>('recent');

	const visible = filterTenants(tenants, { query, status, plan, sort });
	const plans = countByPlan(tenants);
	const active = tenants.filter((tenant) => tenantStatus(tenant) === 'active');
	const reach = active.reduce((total, tenant) => total + tenant.memberCount, 0);

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader title={t('title')} description={t('description', { brand: BRAND.name })} />

			<div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<Stat label={t('active')} value={String(active.length)} />
				<Stat label={t('reach')} value={formatMembers(reach)} />
				<Stat label={t('paying')} value={String(plans.pro + plans.ultimate)} />
				<Stat label={t('left')} value={String(tenants.length - active.length)} />
			</div>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder={t('search')}
					aria-label={t('searchLabel')}
					className="max-w-80"
				/>

				<SegmentedControl
					options={[
						{ value: 'active', label: t('statusActive') },
						{ value: 'left', label: t('statusLeft') },
						{ value: 'all', label: t('statusAll') }
					]}
					value={status}
					onValueChange={setStatus}
					label={t('status')}
					size="sm"
				/>

				<Select
					options={[
						{ value: 'all', label: t('everyPlan') },
						{ value: 'free', label: 'Free' },
						{ value: 'pro', label: 'Pro' },
						{ value: 'ultimate', label: 'Ultimate' }
					]}
					value={plan}
					onValueChange={(value) => {
						setPlan(toPlanFilter(value));
					}}
					className="w-40"
				/>

				<Select
					options={TENANT_SORTS.map((option) => ({
						value: option,
						label: TENANT_SORT_LABELS[option]
					}))}
					value={sort}
					onValueChange={(value) => {
						setSort(toTenantSort(value));
					}}
					className="w-40"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState icon={Building2} title={t('emptyTitle')} description={t('emptyBody')} />
				) : (
					<ul>
						{visible.map((tenant) => {
							const gone = tenantStatus(tenant) === 'left';

							return (
								<li key={tenant.id} className="border-b border-border last:border-0">
									<Link
										href={`/admin/tenants/${tenant.id}`}
										className="flex items-center gap-3 px-4 py-3 transition-colors duration-120 ease-out hover:bg-surface-hover"
									>
										<Avatar
											initials={tenant.initials}
											color={tenant.color}
											shape="square"
											size="md"
										/>

										<span className="min-w-0 flex-1">
											<span className="flex items-center gap-2">
												<span className="truncate text-body font-medium">{tenant.name}</span>
												{gone ? <Badge variant="danger">{t('badgeLeft')}</Badge> : null}
												{tenant.setupCompleted ? null : (
													<Badge variant="warning">{t('badgeSetup')}</Badge>
												)}
											</span>
											<span className="block truncate font-mono text-caption text-text-muted">
												{tenant.id} · {tenant.ownerName}
											</span>
										</span>

										<span className="tabular hidden w-20 shrink-0 text-right text-body-sm text-text-muted sm:block">
											{formatMembers(tenant.memberCount)}
										</span>

										<Badge variant={PLAN_VARIANTS[tenant.planKey]}>
											{PLAN_LABELS[tenant.planKey]}
										</Badge>

										<span
											className="tabular hidden w-32 shrink-0 text-right font-mono text-caption text-text-muted md:block"
											title={dateOnly(tenant.joinedAt)}
										>
											{gone
												? `left ${relativeTime(tenant.leftAt ?? tenant.joinedAt)}`
												: `joined ${relativeTime(tenant.joinedAt)}`}
										</span>

										<ExternalLink className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
									</Link>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<p className="mt-3 text-caption font-normal text-text-muted">
				{t('showing', { shown: visible.length, total: tenants.length })}
			</p>
		</div>
	);
}
