'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
	DatabaseZap,
	Download,
	Mail,
	Monitor,
	MonitorSmartphone,
	Server,
	SlidersHorizontal,
	Smartphone,
	Trash2,
	User,
	X,
	type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ConfirmDialog } from '@/components/management/ConfirmDialog';
import { SaveBar } from '@/components/modules/SaveBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { BRAND } from '@/lib/brand';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { rememberLocale } from '@/lib/locale-client';
import { guildHref } from '@/lib/navigation';
import { relativeTime } from '@/lib/time';
import type { AccountPreferences, AccountSession } from '@/lib/types/account';
import type { Guild } from '@/lib/types/guild';
import type { SessionUser } from '@/lib/types/session';
import { cn } from '@/lib/utils/cn';

const TABS = [
	{ id: 'profile', icon: User },
	{ id: 'interface', icon: SlidersHorizontal },
	{ id: 'email', icon: Mail },
	{ id: 'servers', icon: Server },
	{ id: 'sessions', icon: MonitorSmartphone },
	{ id: 'data', icon: DatabaseZap }
] as const satisfies readonly { id: string; icon: LucideIcon }[];

type TabId = (typeof TABS)[number]['id'];

const STEPS: Record<string, number> = {
	ArrowDown: 1,
	ArrowRight: 1,
	ArrowUp: -1,
	ArrowLeft: -1
};

const tabClass =
	'flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-body-sm whitespace-nowrap transition-colors duration-120 ease-out [&_svg]:size-4 [&_svg]:shrink-0';

type AccountPanelProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	returnFocusTo: RefObject<HTMLElement | null>;
	user: SessionUser;
	preferences: AccountPreferences;
	sessions: AccountSession[];
	guilds: Guild[];
};

export function AccountPanel({
	open,
	onOpenChange,
	returnFocusTo,
	user,
	preferences,
	sessions,
	guilds
}: AccountPanelProps) {
	const t = useTranslations('account');
	const localeNames = useTranslations('locales');
	const shared = useTranslations('common');
	const router = useRouter();
	const form = useConfigDraft<AccountPreferences>(preferences);
	const draft = form.draft;
	const [active, setActive] = useState(sessions);
	const [deleting, setDeleting] = useState(false);
	const [tab, setTab] = useState<TabId>('profile');
	const rail = useRef<HTMLDivElement>(null);

	const localeOptions = SUPPORTED_LOCALES.map((value) => ({ value, label: localeNames(value) }));

	function move(next: TabId) {
		setTab(next);
		rail.current?.querySelector<HTMLButtonElement>(`[data-tab="${next}"]`)?.focus();
	}

	function onRailKeyDown(event: KeyboardEvent<HTMLDivElement>) {
		const index = TABS.findIndex((entry) => entry.id === tab);
		const step = STEPS[event.key];

		if (step !== undefined) {
			event.preventDefault();
			const next = TABS[(index + step + TABS.length) % TABS.length];
			if (next) move(next.id);
			return;
		}

		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			const next = event.key === 'Home' ? TABS[0] : TABS[TABS.length - 1];
			if (next) move(next.id);
		}
	}

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop" />
				<DialogPrimitive.Content
					aria-describedby={undefined}
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						returnFocusTo.current?.focus();
					}}
					className="fixed top-1/2 left-1/2 z-50 flex h-[min(32rem,calc(100svh-2rem))] w-[calc(100vw-2rem)] max-w-4xl -translate-1/2 flex-col overflow-hidden rounded-xl border border-border-strong bg-surface-raised shadow-3 data-[state=open]:animate-scale-in"
				>
					<header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
						<div className="min-w-0 flex-1">
							<DialogPrimitive.Title className="text-h3">{t('title')}</DialogPrimitive.Title>
							<p className="mt-0.5 truncate text-body-sm text-text-muted">
								{t('subtitle', { brand: BRAND.name })}
							</p>
						</div>
						<DialogPrimitive.Close
							aria-label={t('close')}
							className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
						>
							<X className="size-4" aria-hidden="true" />
						</DialogPrimitive.Close>
					</header>

					<div className="flex min-h-0 flex-1 flex-col sm:flex-row">
						<div
							ref={rail}
							role="tablist"
							aria-label={t('sections')}
							aria-orientation="vertical"
							onKeyDown={onRailKeyDown}
							className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-border p-2 sm:w-48 sm:flex-col sm:overflow-x-visible sm:border-r sm:border-b-0"
						>
							{TABS.map((entry) => {
								const selected = entry.id === tab;
								return (
									<button
										key={entry.id}
										type="button"
										role="tab"
										data-tab={entry.id}
										id={`account-tab-${entry.id}`}
										aria-selected={selected}
										aria-controls="account-tabpanel"
										tabIndex={selected ? 0 : -1}
										onClick={() => {
											setTab(entry.id);
										}}
										className={cn(
											tabClass,
											selected
												? 'bg-primary-subtle font-medium text-primary'
												: 'text-text-muted hover:bg-surface-hover hover:text-text'
										)}
									>
										<entry.icon aria-hidden="true" />
										{t(`tabs.${entry.id}`)}
									</button>
								);
							})}
						</div>

						<div
							id="account-tabpanel"
							role="tabpanel"
							aria-labelledby={`account-tab-${tab}`}
							tabIndex={0}
							className="min-h-0 min-w-0 flex-1 thin-scroll overflow-y-auto p-5"
						>
							{tab === 'profile' ? (
								<Pane
									title={t('profile.title')}
									description={t('profile.description')}
									action={<Badge variant="outline">{t('profile.managed')}</Badge>}
								>
									<div className="flex items-center gap-4">
										<Avatar initials={user.initials} color={user.color} shape="circle" size="lg" />
										<div className="min-w-0">
											<p className="truncate text-h4">{user.displayName}</p>
											<p className="truncate font-mono text-caption font-normal text-text-muted">
												{user.handle}
											</p>
										</div>
									</div>

									<Field label={t('profile.idLabel')} hint={t('profile.idHint')}>
										<Input value={user.id} readOnly className="max-w-80 font-mono" />
									</Field>

									<p className="text-body-sm text-pretty text-text-muted">
										{t('profile.upstream', { brand: BRAND.name })}
									</p>
								</Pane>
							) : null}

							{tab === 'interface' ? (
								<Pane title={t('interface.title')} description={t('interface.description')}>
									<Field label={t('interface.language')}>
										<Select
											options={localeOptions}
											value={draft.locale}
											onValueChange={(next) => {
												form.set('locale', next);
											}}
											className="max-w-80"
										/>
									</Field>

									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-body-sm font-medium">{t('interface.theme')}</p>
											<p className="text-caption font-normal text-text-muted">
												{t('interface.themeHint')}
											</p>
										</div>
										<ThemeToggle />
									</div>
								</Pane>
							) : null}

							{tab === 'email' ? (
								<Pane title={t('email.title')} description={t('email.description')}>
									<Switch
										checked={draft.emailOnMention}
										onCheckedChange={(next) => {
											form.set('emailOnMention', next);
										}}
										label={t('email.onMention')}
										description={t('email.onMentionHint')}
									/>
									<Switch
										checked={draft.emailOnCase}
										onCheckedChange={(next) => {
											form.set('emailOnCase', next);
										}}
										label={t('email.onCase')}
									/>
									<Switch
										checked={draft.emailProduct}
										onCheckedChange={(next) => {
											form.set('emailProduct', next);
										}}
										label={t('email.onProduct', { brand: BRAND.name })}
										description={t('email.onProductHint')}
									/>
								</Pane>
							) : null}

							{tab === 'servers' ? (
								<Pane
									title={t('servers.title')}
									description={t('servers.description', { count: guilds.length })}
								>
									<ul className="flex flex-col">
										{guilds.map((guild) => (
											<li
												key={guild.id}
												className="flex items-center gap-3 border-b border-border py-3 first:pt-0 last:border-0"
											>
												<Avatar initials={guild.initials} color={guild.color} size="sm" />
												<div className="min-w-0 flex-1">
													<p className="truncate text-body">{guild.name}</p>
													<p className="truncate text-caption font-normal text-text-muted">
														{guild.hasBot
															? t('servers.present', { brand: BRAND.name })
															: t('servers.absent')}
													</p>
												</div>
												{guild.hasBot ? (
													<Button
														variant="ghost"
														size="sm"
														href={guildHref(guild.id, '')}
														onClick={() => {
															onOpenChange(false);
														}}
													>
														{shared('open')}
													</Button>
												) : (
													<Badge variant="outline">{t('servers.noBot')}</Badge>
												)}
											</li>
										))}
									</ul>
								</Pane>
							) : null}

							{tab === 'sessions' ? (
								<Pane
									title={t('sessions.title')}
									description={t('sessions.description')}
									action={
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setActive((current) => current.filter((entry) => entry.current));
												toast.success(t('sessions.signedOutOthers'));
											}}
										>
											{t('sessions.signOutOthers')}
										</Button>
									}
								>
									<ul className="flex flex-col">
										{active.map((session) => (
											<li
												key={session.id}
												className="flex flex-wrap items-center gap-3 border-b border-border py-3 first:pt-0 last:border-0"
											>
												{session.deviceKind === 'mobile' ? (
													<Smartphone
														className="size-4 shrink-0 text-text-subtle"
														aria-hidden="true"
													/>
												) : (
													<Monitor
														className="size-4 shrink-0 text-text-subtle"
														aria-hidden="true"
													/>
												)}
												<div className="min-w-40 flex-1">
													<p className="text-body">
														{session.device} · {session.browser}
														{session.current ? (
															<Badge variant="success" className="ml-2">
																{t('sessions.thisDevice')}
															</Badge>
														) : null}
													</p>
													<p className="font-mono text-caption font-normal text-text-muted">
														{session.location} · {session.ip} · {relativeTime(session.lastSeenAt)}
													</p>
												</div>
												{session.current ? null : (
													<Button
														variant="ghost-danger"
														size="sm"
														onClick={() => {
															setActive((current) =>
																current.filter((entry) => entry.id !== session.id)
															);
															toast.success(t('sessions.revoked', { device: session.device }));
														}}
													>
														{t('sessions.revoke')}
													</Button>
												)}
											</li>
										))}
									</ul>
								</Pane>
							) : null}

							{tab === 'data' ? (
								<Pane title={t('data.title')} description={t('data.description')} danger>
									<div className="flex flex-wrap items-start gap-3 border-b border-border pb-4">
										<div className="min-w-60 flex-1">
											<p className="text-body font-medium">{t('data.downloadTitle')}</p>
											<p className="text-body-sm text-pretty text-text-muted">
												{t('data.downloadBody')}
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												toast.success(t('data.downloadRequested'), {
													description: t('data.downloadRequestedHint')
												});
											}}
										>
											<Download aria-hidden="true" />
											{t('data.download')}
										</Button>
									</div>

									<div className="flex flex-wrap items-start gap-3">
										<div className="min-w-60 flex-1">
											<p className="text-body font-medium">{t('data.deleteTitle')}</p>
											<p className="text-body-sm text-pretty text-text-muted">
												{t('data.deleteBody')}
											</p>
										</div>
										<Button
											variant="danger"
											size="sm"
											onClick={() => {
												setDeleting(true);
											}}
										>
											<Trash2 aria-hidden="true" />
											{t('data.delete')}
										</Button>
									</div>
								</Pane>
							) : null}
						</div>
					</div>

					<SaveBar
						dirty={form.dirty}
						changedCount={form.changedCount}
						state={form.state}
						onDiscard={form.discard}
						onSave={() => {
							void form.save().then(() => {
								rememberLocale(draft.locale);
								router.refresh();
								toast.success(t('saved'));
							});
						}}
						onResolveConflict={form.resolveConflict}
						className="static m-0 sm:mx-0 sm:mb-0"
					/>

					<ConfirmDialog
						open={deleting}
						onOpenChange={setDeleting}
						title={t('data.confirmTitle')}
						description={t('data.confirmDescription')}
						confirmPhrase={t('data.confirmPhrase')}
						confirmLabel={t('data.confirmLabel')}
						onConfirm={() => {
							toast.success(t('data.scheduled'), { description: t('data.scheduledHint') });
						}}
					>
						<p className="text-body-sm text-pretty text-text-muted">
							{t('data.confirmBody', { count: guilds.length })}
						</p>
					</ConfirmDialog>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

function Pane({
	title,
	description,
	action,
	danger = false,
	children
}: {
	title: string;
	description: string;
	action?: ReactNode;
	danger?: boolean;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-5">
			<header className="flex items-start gap-3">
				<div className="min-w-0 flex-1">
					<h2 className={cn('text-h4', danger && 'text-danger')}>{title}</h2>
					<p className="mt-0.5 text-body-sm text-pretty text-text-muted">{description}</p>
				</div>
				{action ? <div className="shrink-0">{action}</div> : null}
			</header>
			{children}
		</section>
	);
}
