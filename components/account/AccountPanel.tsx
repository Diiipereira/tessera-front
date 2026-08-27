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
import { guildHref } from '@/lib/navigation';
import { relativeTime } from '@/lib/time';
import type { AccountPreferences, AccountSession } from '@/lib/types/account';
import type { Guild } from '@/lib/types/guild';
import type { SessionUser } from '@/lib/types/session';
import { cn } from '@/lib/utils/cn';

const LOCALES = [
	{ value: 'en-US', label: 'English (US)' },
	{ value: 'pt-BR', label: 'Português (Brasil)' },
	{ value: 'es-ES', label: 'Español' },
	{ value: 'fr-FR', label: 'Français' }
];

const TABS = [
	{ id: 'profile', label: 'Profile', icon: User },
	{ id: 'interface', label: 'Interface', icon: SlidersHorizontal },
	{ id: 'email', label: 'Email', icon: Mail },
	{ id: 'servers', label: 'Servers', icon: Server },
	{ id: 'sessions', label: 'Sessions', icon: MonitorSmartphone },
	{ id: 'data', label: 'Your data', icon: DatabaseZap }
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

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
	const form = useConfigDraft<AccountPreferences>(preferences);
	const draft = form.draft;
	const [active, setActive] = useState(sessions);
	const [deleting, setDeleting] = useState(false);
	const [tab, setTab] = useState<TabId>('profile');
	const rail = useRef<HTMLDivElement>(null);

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
							<DialogPrimitive.Title className="text-h3">Account</DialogPrimitive.Title>
							<p className="mt-0.5 truncate text-body-sm text-text-muted">
								{`Your ${BRAND.name} account, the devices signed in to it, and what leaves your inbox.`}
							</p>
						</div>
						<DialogPrimitive.Close
							aria-label="Close account settings"
							className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
						>
							<X className="size-4" aria-hidden="true" />
						</DialogPrimitive.Close>
					</header>

					<div className="flex min-h-0 flex-1 flex-col sm:flex-row">
						<div
							ref={rail}
							role="tablist"
							aria-label="Account sections"
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
										{entry.label}
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
									title="Profile"
									description="Read from Discord every time you sign in."
									action={<Badge variant="outline">Managed by Discord</Badge>}
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

									<Field
										label="Discord ID"
										hint="Support asks for this when something needs looking up."
									>
										<Input value={user.id} readOnly className="max-w-80 font-mono" />
									</Field>

									<p className="text-body-sm text-pretty text-text-muted">
										Change your name or avatar in Discord — {BRAND.name} picks it up on the next
										sign-in.
									</p>
								</Pane>
							) : null}

							{tab === 'interface' ? (
								<Pane title="Interface" description="Applies everywhere you sign in.">
									<Field label="Language">
										<Select
											options={LOCALES}
											value={draft.locale}
											onValueChange={(next) => {
												form.set('locale', next);
											}}
											className="max-w-80"
										/>
									</Field>

									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-body-sm font-medium">Theme</p>
											<p className="text-caption font-normal text-text-muted">
												Saved in this browser, not on your account.
											</p>
										</div>
										<ThemeToggle />
									</div>
								</Pane>
							) : null}

							{tab === 'email' ? (
								<Pane title="Email" description="We never email about anything else.">
									<Switch
										checked={draft.emailOnMention}
										onCheckedChange={(next) => {
											form.set('emailOnMention', next);
										}}
										label="When someone mentions me in a ticket"
										description="Only for tickets you are assigned to."
									/>
									<Switch
										checked={draft.emailOnCase}
										onCheckedChange={(next) => {
											form.set('emailOnCase', next);
										}}
										label="When a case I opened is edited or revoked"
									/>
									<Switch
										checked={draft.emailProduct}
										onCheckedChange={(next) => {
											form.set('emailProduct', next);
										}}
										label={`What is new in ${BRAND.name}`}
										description="At most once a month, and never about pricing."
									/>
								</Pane>
							) : null}

							{tab === 'servers' ? (
								<Pane
									title="Servers"
									description={`${String(guilds.length)} servers you can manage.`}
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
														{guild.hasBot ? `${BRAND.name} is in this server` : 'Not added yet'}
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
														Open
													</Button>
												) : (
													<Badge variant="outline">No bot</Badge>
												)}
											</li>
										))}
									</ul>
								</Pane>
							) : null}

							{tab === 'sessions' ? (
								<Pane
									title="Active sessions"
									description="Signing out everywhere ends all of them but this one."
									action={
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setActive((current) => current.filter((entry) => entry.current));
												toast.success('Signed out everywhere else');
											}}
										>
											Sign out everywhere
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
																This device
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
															toast.success(`Signed out of ${session.device}`);
														}}
													>
														Revoke
													</Button>
												)}
											</li>
										))}
									</ul>
								</Pane>
							) : null}

							{tab === 'data' ? (
								<Pane title="Your data" description="Yours to take, yours to delete." danger>
									<div className="flex flex-wrap items-start gap-3 border-b border-border pb-4">
										<div className="min-w-60 flex-1">
											<p className="text-body font-medium">Download my data</p>
											<p className="text-body-sm text-pretty text-text-muted">
												Everything tied to your account: sessions, preferences and the audit entries
												you produced.
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												toast.success('Export requested', {
													description: 'You get an email when the archive is ready.'
												});
											}}
										>
											<Download aria-hidden="true" />
											Download
										</Button>
									</div>

									<div className="flex flex-wrap items-start gap-3">
										<div className="min-w-60 flex-1">
											<p className="text-body font-medium">Delete my account</p>
											<p className="text-body-sm text-pretty text-text-muted">
												Removes your access to every server here. The servers themselves and their
												configuration stay.
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
											Delete account
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
								toast.success('Preferences saved');
							});
						}}
						onResolveConflict={form.resolveConflict}
						className="static m-0 sm:mx-0 sm:mb-0"
					/>

					<ConfirmDialog
						open={deleting}
						onOpenChange={setDeleting}
						title="Delete your account?"
						description="This cannot be undone, and support cannot restore it."
						confirmPhrase="DELETE"
						confirmLabel="Delete my account"
						onConfirm={() => {
							toast.success('Account scheduled for deletion', {
								description: 'You have 7 days to sign in again and stop it.'
							});
						}}
					>
						<p className="text-body-sm text-pretty text-text-muted">
							You lose access to {guilds.length} servers. If you are the only Owner of one, hand the
							seat over first — otherwise nobody can change its plan.
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
