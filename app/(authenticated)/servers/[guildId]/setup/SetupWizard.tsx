'use client';

import {
	ArrowLeft,
	ArrowRight,
	Check,
	DoorOpen,
	Gift,
	PartyPopper,
	ScrollText,
	Shield,
	ShieldAlert,
	Ticket,
	TrendingUp,
	type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BrandMark } from '@/components/auth/BrandMark';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { BRAND } from '@/lib/brand';
import { guildHref } from '@/lib/navigation';
import type { Channel, Role } from '@/lib/types/discord';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';

const STEPS = ['basics', 'modules', 'staff', 'done'] as const;

const MODULES: { id: string; icon: LucideIcon }[] = [
	{
		id: 'welcome',
		icon: DoorOpen
	},
	{
		id: 'moderation',
		icon: Shield
	},
	{
		id: 'automod',
		icon: ShieldAlert
	},
	{
		id: 'logging',
		icon: ScrollText
	},
	{ id: 'levels', icon: TrendingUp },
	{
		id: 'tickets',
		icon: Ticket
	},
	{
		id: 'giveaways',
		icon: Gift
	}
];

const LANGUAGES = [
	{ value: 'en', label: 'English' },
	{ value: 'pt-BR', label: 'Português (Brasil)' },
	{ value: 'es', label: 'Español' }
];

const TIMEZONES = [
	{ value: 'America/Sao_Paulo', label: 'America/São Paulo (GMT-3)' },
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Europe/Lisbon', label: 'Europe/Lisbon (GMT+0)' },
	{ value: 'America/New_York', label: 'America/New York (GMT-5)' }
];

function labelFor(options: { value: string; label: string }[], value: string): string {
	return options.find((option) => option.value === value)?.label ?? value;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-0">
			<span className="text-body-sm text-text-muted">{label}</span>
			<span className="min-w-0 text-right text-body">{value}</span>
		</div>
	);
}

type SetupWizardProps = {
	guild: Guild;
	channels: Channel[];
	roles: Role[];
};

export function SetupWizard({ guild, channels, roles }: SetupWizardProps) {
	const t = useTranslations('setup');
	const catalog = useTranslations('catalog');
	const names = useTranslations('nav');
	const [step, setStep] = useState(0);
	const [language, setLanguage] = useState('en');
	const [timezone, setTimezone] = useState('UTC');
	const [enabled, setEnabled] = useState<string[]>(['welcome', 'moderation', 'logging']);
	const [logChannel, setLogChannel] = useState<string | null>(null);
	const [modRoles, setModRoles] = useState<string[]>([]);

	const dashboardHref = guildHref(guild.id, '');
	const isLast = step === STEPS.length - 1;

	const selectedModules = MODULES.filter((module) => enabled.includes(module.id));
	const selectedChannel = channels.find((channel) => channel.id === logChannel);
	const selectedRoles = roles.filter((role) => modRoles.includes(role.id));

	function toggleModule(id: string, checked: boolean) {
		setEnabled((current) => (checked ? [...current, id] : current.filter((entry) => entry !== id)));
	}

	return (
		<div className="flex min-h-svh flex-col bg-bg">
			<header className="flex items-center gap-3 border-b border-border px-6 py-4 sm:px-8">
				<BrandMark size="sm" />
				<span className="text-body font-medium">{guild.name}</span>
				<div className="flex-1" />
				<Button variant="ghost" size="sm" href={dashboardHref}>
					{t('skip')}
				</Button>
			</header>

			<div className="mx-auto flex w-full max-w-160 flex-1 flex-col gap-8 px-6 py-10 sm:px-8">
				<ol className="flex items-center gap-2">
					{STEPS.map((id, index) => (
						<li key={id} className="flex flex-1 items-center gap-2">
							<span
								className={cn(
									'grid size-8 shrink-0 place-items-center rounded-full border text-body-sm font-medium transition-colors duration-120 ease-out',
									index < step
										? 'border-success bg-success text-on-dark'
										: index === step
											? 'border-primary text-primary ring-2 ring-primary/30'
											: 'border-border text-text-muted'
								)}
								aria-current={index === step ? 'step' : undefined}
							>
								{index < step ? <Check className="size-4" aria-hidden="true" /> : index + 1}
							</span>
							<span
								className={cn(
									'hidden text-body-sm sm:inline',
									index === step ? 'font-medium text-text' : 'text-text-muted'
								)}
							>
								{t(`steps.${id}`)}
							</span>
							{index < STEPS.length - 1 ? (
								<span
									className={cn('h-px flex-1', index < step ? 'bg-success' : 'bg-border')}
									aria-hidden="true"
								/>
							) : null}
						</li>
					))}
				</ol>

				{step === 0 ? (
					<section className="flex flex-col gap-5">
						<div>
							<h1 className="text-h2">{t('basics.title')}</h1>
							<p className="text-body text-text-muted">{t('basics.body', { brand: BRAND.name })}</p>
						</div>
						<Field label={t('basics.language')} hint={t('basics.languageHint')}>
							<Select options={LANGUAGES} value={language} onValueChange={setLanguage} />
						</Field>
						<Field label={t('basics.timezone')} hint={t('basics.timezoneHint')}>
							<Select options={TIMEZONES} value={timezone} onValueChange={setTimezone} />
						</Field>
					</section>
				) : step === 1 ? (
					<section className="flex flex-col gap-5">
						<div>
							<h1 className="text-h2">{t('modules.title', { brand: BRAND.name })}</h1>
							<p className="text-body text-text-muted">{t('modules.body')}</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{MODULES.map((module) => {
								const checked = enabled.includes(module.id);
								const Icon = module.icon;
								return (
									<label
										key={module.id}
										className={cn(
											'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors duration-120 ease-out',
											checked
												? 'border-primary bg-primary-subtle'
												: 'border-border bg-surface hover:border-border-strong'
										)}
									>
										<Checkbox
											checked={checked}
											onCheckedChange={(next) => {
												toggleModule(module.id, next === true);
											}}
										/>
										<span className="min-w-0 flex-1">
											<span className="flex items-center gap-2">
												<Icon
													className={cn(
														'size-4 shrink-0',
														checked ? 'text-primary' : 'text-text-subtle'
													)}
													aria-hidden="true"
												/>
												<span className="text-body font-medium">{names(module.id)}</span>
											</span>
											<span className="mt-0.5 block text-body-sm text-pretty text-text-muted">
												{catalog(`blurb.${module.id}`)}
											</span>
										</span>
									</label>
								);
							})}
						</div>
					</section>
				) : step === 2 ? (
					<section className="flex flex-col gap-5">
						<div>
							<h1 className="text-h2">{t('staff.title')}</h1>
							<p className="text-body text-text-muted">{t('staff.body', { brand: BRAND.name })}</p>
						</div>
						<Field label={t('staff.logChannel')} hint={t('staff.logChannelHint')}>
							<ChannelPicker channels={channels} value={logChannel} onValueChange={setLogChannel} />
						</Field>
						<Field label={t('staff.roles')} hint={t('staff.rolesHint')}>
							<RolePicker roles={roles} value={modRoles} onValueChange={setModRoles} />
						</Field>
					</section>
				) : (
					<section className="flex flex-col gap-5">
						<div className="flex flex-col items-center gap-3 py-4 text-center">
							<span className="grid size-16 place-items-center rounded-full bg-success-subtle text-success">
								<PartyPopper className="size-8" aria-hidden="true" />
							</span>
							<div>
								<h1 className="text-h2">{t('done.title')}</h1>
								<p className="text-body text-text-muted">
									{t('done.body', { brand: BRAND.name, guild: guild.name })}
								</p>
							</div>
						</div>

						<div className="rounded-lg border border-border bg-surface px-4 shadow-1">
							<SummaryRow label={t('done.language')} value={labelFor(LANGUAGES, language)} />
							<SummaryRow label={t('done.timezone')} value={labelFor(TIMEZONES, timezone)} />
							<SummaryRow
								label={t('done.modulesOn')}
								value={
									selectedModules.length > 0
										? selectedModules.map((module) => names(module.id)).join(', ')
										: t('done.noneYet')
								}
							/>
							<SummaryRow
								label={t('done.logChannel')}
								value={selectedChannel ? `#${selectedChannel.name}` : t('done.notSet')}
							/>
							<SummaryRow
								label={t('done.roles')}
								value={
									selectedRoles.length > 0
										? selectedRoles.map((role) => role.name).join(', ')
										: t('done.notSet')
								}
							/>
						</div>
					</section>
				)}
			</div>

			<footer className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-surface-raised px-6 py-4 sm:px-8">
				<Button
					variant="ghost"
					disabled={step === 0}
					onClick={() => {
						setStep((current) => current - 1);
					}}
				>
					<ArrowLeft aria-hidden="true" />
					{t('back')}
				</Button>
				<div className="flex-1" />
				{isLast ? (
					<Button href={dashboardHref}>
						{t('dashboard')}
						<ArrowRight aria-hidden="true" />
					</Button>
				) : (
					<Button
						onClick={() => {
							setStep((current) => current + 1);
						}}
					>
						{t('next')}
						<ArrowRight aria-hidden="true" />
					</Button>
				)}
			</footer>
		</div>
	);
}
