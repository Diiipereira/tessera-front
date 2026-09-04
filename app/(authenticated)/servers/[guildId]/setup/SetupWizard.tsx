'use client';

import { ArrowLeft, ArrowRight, Check, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BrandMark } from '@/components/auth/BrandMark';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Combobox } from '@/components/ui/Combobox';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { BRAND } from '@/lib/brand';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { moduleIcons } from '@/lib/module-icons';
import { patchModule } from '@/lib/module-client';
import { guildHref } from '@/lib/navigation';
import { patchSettings } from '@/lib/settings-client';
import {
	needsWelcomeChannel,
	startingDraft,
	toSetupWrites,
	type SetupDraft,
	type SetupModule
} from '@/lib/setup';
import { timezoneOptions, zoneLabel } from '@/lib/timezones';
import type { Channel, Role } from '@/lib/types/discord';
import type { Guild } from '@/lib/types/guild';
import type { GuildSettings } from '@/lib/types/management';
import type { ModuleId } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

const STEPS = ['basics', 'modules', 'channels', 'done'] as const;

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
	settings: GuildSettings;
	modules: SetupModule[];
	channels: Channel[];
	roles: Role[];
};

export function SetupWizard({ guild, settings, modules, channels, roles }: SetupWizardProps) {
	const t = useTranslations('setup');
	const catalog = useTranslations('catalog');
	const names = useTranslations('nav');
	const localeNames = useTranslations('locales');
	const router = useRouter();
	const languageOptions = SUPPORTED_LOCALES.map((value) => ({ value, label: localeNames(value) }));
	const timezones = useMemo(() => timezoneOptions(), []);
	const [step, setStep] = useState(0);
	const [saving, setSaving] = useState(false);
	const [draft, setDraft] = useState<SetupDraft>(() => startingDraft(settings, modules));

	const dashboardHref = guildHref(guild.id, '');
	const isLast = step === STEPS.length - 1;
	const missingWelcomeChannel = needsWelcomeChannel(draft);
	const blocked = step === 2 && missingWelcomeChannel;

	const chosenModules = modules.filter((module) => draft.wanted.includes(module.id));
	const logChannel = channels.find((channel) => channel.id === draft.logChannelId);
	const welcomeChannel = channels.find((channel) => channel.id === draft.welcomeChannelId);
	const selectedRoles = roles.filter((role) => draft.protectedRoleIds.includes(role.id));

	function set<K extends keyof SetupDraft>(key: K, value: SetupDraft[K]) {
		setDraft((current) => ({ ...current, [key]: value }));
	}

	function toggleModule(id: ModuleId, checked: boolean) {
		setDraft((current) => ({
			...current,
			wanted: checked ? [...current.wanted, id] : current.wanted.filter((entry) => entry !== id)
		}));
	}

	async function finish() {
		setSaving(true);

		const written = await patchSettings(guild.id, {
			locale: draft.locale,
			timezone: draft.timezone
		});

		if (written.status === 'error') {
			setSaving(false);
			toast.error(t('failed'), { description: written.message });
			return;
		}

		for (const write of toSetupWrites(modules, draft)) {
			const result = await patchModule(guild.id, write.id, {
				version: write.version,
				enabled: write.enabled,
				config: write.config
			});

			if (result.status === 'error') {
				setSaving(false);
				toast.error(t('failed'), { description: `${names(write.id)}: ${result.message}` });
				return;
			}
		}

		const done = await patchSettings(guild.id, { setupCompleted: true });

		setSaving(false);

		if (done.status === 'error') {
			toast.error(t('failed'), { description: done.message });
			return;
		}

		toast.success(t('saved', { brand: BRAND.name }));
		router.push(dashboardHref);
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
							<Select
								options={languageOptions}
								value={draft.locale}
								onValueChange={(next) => {
									set('locale', next);
								}}
							/>
						</Field>
						<Field label={t('basics.timezone')} hint={t('basics.timezoneHint')}>
							<Combobox
								options={timezones}
								value={draft.timezone}
								onValueChange={(next) => {
									set('timezone', next);
								}}
								placeholder={t('basics.timezonePlaceholder')}
								searchPlaceholder={t('basics.timezoneSearch')}
								emptyLabel={t('basics.timezoneEmpty')}
							/>
						</Field>
					</section>
				) : step === 1 ? (
					<section className="flex flex-col gap-5">
						<div>
							<h1 className="text-h2">{t('modules.title', { brand: BRAND.name })}</h1>
							<p className="text-body text-text-muted">{t('modules.body')}</p>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{modules.map((module) => {
								const checked = draft.wanted.includes(module.id);
								const Icon = moduleIcons[module.id];

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
							<h1 className="text-h2">{t('channels.title', { brand: BRAND.name })}</h1>
							<p className="text-body text-text-muted">
								{t('channels.body', { brand: BRAND.name })}
							</p>
						</div>
						{draft.wanted.includes('welcome') ? (
							<Field
								label={t('channels.welcomeChannel')}
								hint={
									missingWelcomeChannel
										? t('channels.welcomeChannelMissing')
										: t('channels.welcomeChannelHint')
								}
							>
								<ChannelPicker
									channels={channels}
									value={draft.welcomeChannelId}
									onValueChange={(next) => {
										set('welcomeChannelId', next);
									}}
								/>
							</Field>
						) : null}
						<Field label={t('channels.logChannel')} hint={t('channels.logChannelHint')}>
							<ChannelPicker
								channels={channels}
								value={draft.logChannelId}
								onValueChange={(next) => {
									set('logChannelId', next);
								}}
							/>
						</Field>
						<Field
							label={t('channels.protectedRoles')}
							hint={t('channels.protectedRolesHint', { brand: BRAND.name })}
						>
							<RolePicker
								roles={roles}
								value={[...draft.protectedRoleIds]}
								onValueChange={(next) => {
									set('protectedRoleIds', next);
								}}
							/>
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
							<SummaryRow label={t('done.language')} value={localeNames(draft.locale)} />
							<SummaryRow label={t('done.timezone')} value={zoneLabel(draft.timezone)} />
							<SummaryRow
								label={t('done.modulesOn')}
								value={
									chosenModules.length > 0
										? chosenModules.map((module) => names(module.id)).join(', ')
										: t('done.noneYet')
								}
							/>
							{welcomeChannel ? (
								<SummaryRow label={t('done.welcomeChannel')} value={`#${welcomeChannel.name}`} />
							) : null}
							<SummaryRow
								label={t('done.logChannel')}
								value={logChannel ? `#${logChannel.name}` : t('done.notSet')}
							/>
							<SummaryRow
								label={t('done.protectedRoles')}
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
					disabled={step === 0 || saving}
					onClick={() => {
						setStep((current) => current - 1);
					}}
				>
					<ArrowLeft aria-hidden="true" />
					{t('back')}
				</Button>
				<div className="flex-1" />
				{isLast ? (
					<Button
						disabled={saving}
						onClick={() => {
							void finish();
						}}
					>
						{saving ? t('saving') : t('finish')}
						<ArrowRight aria-hidden="true" />
					</Button>
				) : (
					<Button
						disabled={blocked}
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
