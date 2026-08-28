'use client';

import { ArrowLeft, Ban, Blocks, Copy, ExternalLink, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
import { TenantActivityChart } from '@/components/admin/TenantActivityChart';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatMembers, tenantStatus } from '@/lib/admin';
import { absoluteTime, dateOnly, relativeTime } from '@/lib/time';
import type {
	DashboardRole,
	SubscriptionStatus,
	TenantDetail,
	TenantModuleState
} from '@/lib/types/admin';
import type { PlanTier } from '@/lib/types/billing';

const PLAN_LABELS: Record<PlanTier, string> = {
	free: 'Free',
	pro: 'Pro',
	ultimate: 'Ultimate'
};

const ROLE_VARIANTS: Record<DashboardRole, BadgeVariant> = {
	owner: 'primary',
	admin: 'info',
	moderator: 'neutral',
	viewer: 'outline'
};

const STATUS_VARIANTS: Record<SubscriptionStatus, BadgeVariant> = {
	active: 'success',
	trialing: 'info',
	past_due: 'warning',
	canceled: 'danger',
	expired: 'danger'
};

function Fact({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-overline text-text-muted uppercase">{label}</dt>
			<dd className="mt-0.5 text-body-sm">{value}</dd>
		</div>
	);
}

function ModuleRow({ module }: { module: TenantModuleState }) {
	const t = useTranslations('admin.tenant');
	return (
		<li className="flex items-center gap-3 border-b border-border px-5 py-2.5 last:border-0">
			<span className="min-w-0 flex-1 truncate text-body-sm">{module.label}</span>

			<span className="tabular hidden w-14 shrink-0 text-right font-mono text-caption text-text-muted sm:block">
				v{module.version}
			</span>

			<span
				className="hidden w-28 shrink-0 text-right font-mono text-caption text-text-muted md:block"
				title={module.updatedAt === null ? undefined : absoluteTime(module.updatedAt)}
			>
				{module.updatedAt === null ? '—' : relativeTime(module.updatedAt)}
			</span>

			<Badge variant={module.enabled ? 'success' : 'neutral'} dot>
				{module.enabled ? t('on') : t('off')}
			</Badge>
		</li>
	);
}

export function TenantScreen({ detail }: { detail: TenantDetail }) {
	const t = useTranslations('admin.tenant');
	const { summary, modules, staff, activity, subscription } = detail;
	const gone = tenantStatus(summary) === 'left';
	const enabled = modules.filter((module) => module.enabled).length;

	return (
		<div className="w-full p-6 sm:p-8">
			<Link
				href="/admin/tenants"
				className="inline-flex items-center gap-2 text-body-sm text-text-muted transition-colors duration-120 ease-out hover:text-text"
			>
				<ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
				{t('allTenants')}
			</Link>

			<header className="mt-4 flex flex-wrap items-start gap-4">
				<Avatar initials={summary.initials} color={summary.color} shape="square" size="lg" />

				<div className="min-w-60 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-h2">{summary.name}</h1>
						<Badge variant={gone ? 'danger' : 'success'} dot>
							{gone ? t('left') : t('active')}
						</Badge>
						{summary.setupCompleted ? null : <Badge variant="warning">{t('setupPending')}</Badge>}
					</div>

					<button
						type="button"
						className="mt-1 inline-flex items-center gap-1.5 font-mono text-caption text-text-muted transition-colors duration-120 ease-out hover:text-text"
						onClick={() => {
							toast.success(t('copied'), { description: summary.id });
						}}
					>
						{summary.id}
						<Copy className="size-3 shrink-0" aria-hidden="true" />
					</button>
				</div>

				<div className="flex shrink-0 flex-wrap items-center gap-2">
					<Button variant="outline" href={`/servers/${summary.id}`}>
						{t('openAsOwner')}
						<ExternalLink aria-hidden="true" />
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							toast.error(t('blacklistFailed'), {
								description: t('blacklistFailedHint')
							});
						}}
					>
						<Ban aria-hidden="true" />
						{t('blacklist')}
					</Button>
				</div>
			</header>

			<div className="mt-6 grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<TenantActivityChart points={activity} />
				</div>

				<Card title={t('tenantCard')}>
					<dl className="grid grid-cols-2 gap-4">
						<Fact label={t('owner')} value={summary.ownerName} />
						<Fact label={t('ownerId')} value={summary.ownerId} />
						<Fact label={t('members')} value={formatMembers(summary.memberCount)} />
						<Fact label={t('locale')} value={summary.locale} />
						<Fact label={t('joined')} value={dateOnly(summary.joinedAt)} />
						<Fact
							label={t('leftAt')}
							value={summary.leftAt === null ? '—' : dateOnly(summary.leftAt)}
						/>
					</dl>
				</Card>
			</div>

			<div className="mt-4 grid gap-4 lg:grid-cols-3">
				<Card
					title={t('modules')}
					description={t('modulesEnabled', { enabled, total: modules.length })}
					padded={false}
					className="lg:col-span-2"
					action={<Blocks className="size-4 text-text-subtle" aria-hidden="true" />}
				>
					<ul>
						{modules.map((module) => (
							<ModuleRow key={module.key} module={module} />
						))}
					</ul>
				</Card>

				<div className="flex flex-col gap-4">
					<Card title={t('plan')}>
						<div className="flex items-center gap-2">
							<Badge variant={summary.planKey === 'free' ? 'neutral' : 'primary'}>
								{PLAN_LABELS[summary.planKey]}
							</Badge>
							{subscription === null ? null : (
								<Badge variant={STATUS_VARIANTS[subscription.status]}>
									{subscription.status.replace('_', ' ')}
								</Badge>
							)}
						</div>

						{subscription === null ? (
							<p className="mt-3 text-body-sm text-text-muted">{t('noSubscription')}</p>
						) : (
							<dl className="mt-4 grid grid-cols-2 gap-4">
								<Fact label={t('provider')} value={subscription.provider} />
								<Fact
									label={t('renews')}
									value={
										subscription.currentPeriodEnd === null
											? '—'
											: dateOnly(subscription.currentPeriodEnd)
									}
								/>
								<Fact
									label={t('cancelAtEnd')}
									value={subscription.cancelAtPeriodEnd ? t('yes') : t('no')}
								/>
							</dl>
						)}
					</Card>

					<Card
						title={t('access')}
						description={t('accessDescription')}
						padded={false}
						action={<Users className="size-4 text-text-subtle" aria-hidden="true" />}
					>
						<ul>
							{staff.map((member) => (
								<li
									key={member.userId}
									className="flex items-center gap-3 border-b border-border px-5 py-2.5 last:border-0"
								>
									<Avatar
										initials={member.initials}
										color={member.color}
										shape="circle"
										size="sm"
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-body-sm">{member.name}</span>
										<span className="block truncate font-mono text-caption text-text-muted">
											{member.source}
										</span>
									</span>
									<Badge variant={ROLE_VARIANTS[member.role]}>{member.role}</Badge>
								</li>
							))}
						</ul>
					</Card>
				</div>
			</div>
		</div>
	);
}
