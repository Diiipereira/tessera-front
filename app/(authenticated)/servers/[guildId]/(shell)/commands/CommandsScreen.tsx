'use client';

import { RefreshCw, SlidersHorizontal, SquareSlash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { SearchInput } from '@/components/ui/SearchInput';
import { NumberInput } from '@/components/ui/NumberInput';
import { Popover } from '@/components/ui/Popover';
import { Switch } from '@/components/ui/Switch';
import {
	categoryCounts,
	COMMAND_CATEGORIES,
	cooldownLabel,
	filterCommands,
	readRestriction
} from '@/lib/commands';
import { relativeTime } from '@/lib/time';
import type { Channel, Role } from '@/lib/types/discord';
import type { BotCommand, CommandCategory } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';

type CommandsScreenProps = {
	commands: BotCommand[];
	roles: Role[];
	channels: Channel[];
	lastSyncedAt: string;
};

export function CommandsScreen({ commands, roles, channels, lastSyncedAt }: CommandsScreenProps) {
	const t = useTranslations('commands');
	const [items, setItems] = useState(commands);
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<CommandCategory | 'all'>('all');
	const [onlyDisabled, setOnlyDisabled] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);

	const counts = categoryCounts(items);
	const visible = filterCommands(items, { query, category, onlyDisabled });
	const enabledCount = items.filter((command) => command.enabled).length;

	const visibleIds = visible.map((command) => command.id);
	const selectedVisible = selected.filter((id) => visibleIds.includes(id));
	const allChecked = visible.length > 0 && selectedVisible.length === visible.length;

	function update(id: string, patch: Partial<BotCommand>) {
		setItems((current) =>
			current.map((command) => (command.id === id ? { ...command, ...patch } : command))
		);
	}

	function bulkSet(enabled: boolean) {
		setItems((current) =>
			current.map((command) => (selected.includes(command.id) ? { ...command, enabled } : command))
		);
		toast.success(
			t('bulk', {
				count: selected.length,
				state: enabled ? t('stateEnabled') : t('stateDisabled')
			})
		);
		setSelected([]);
	}

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description', { enabled: enabledCount, total: items.length })}
				action={
					<Button
						variant="outline"
						onClick={() => {
							toast.success(t('syncQueued'), {
								description: t('syncHint')
							});
						}}
					>
						<RefreshCw aria-hidden="true" />
						{t('sync')}
					</Button>
				}
			/>

			<p className="mt-1 text-caption font-normal text-text-muted">
				{t('lastSynced', { when: relativeTime(lastSyncedAt) })}
			</p>

			<div className="mt-6 grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
				<aside className="lg:sticky lg:top-6 lg:self-start">
					<p className="mb-2 font-mono text-overline text-text-muted uppercase">
						{t('categories')}
					</p>
					<ul className="flex flex-wrap gap-1 lg:flex-col">
						<li>
							<CategoryButton
								label={t('allCommands')}
								count={items.length}
								active={category === 'all'}
								onClick={() => {
									setCategory('all');
								}}
							/>
						</li>
						{COMMAND_CATEGORIES.map((entry) => (
							<li key={entry}>
								<CategoryButton
									label={entry}
									count={counts[entry]}
									active={category === entry}
									onClick={() => {
										setCategory(entry);
									}}
								/>
							</li>
						))}
					</ul>
				</aside>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<SearchInput
							value={query}
							onValueChange={setQuery}
							placeholder={t('search')}
							aria-label={t('searchLabel')}
							className="max-w-64"
						/>

						<Checkbox
							checked={onlyDisabled}
							onCheckedChange={(next) => {
								setOnlyDisabled(next === true);
							}}
							label={t('onlyDisabled')}
						/>

						{selected.length > 0 ? (
							<div className="ml-auto flex items-center gap-2">
								<span className="text-body-sm text-text-muted">
									{t('selected', { count: selected.length })}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										bulkSet(true);
									}}
								>
									{t('enable')}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										bulkSet(false);
									}}
								>
									{t('disable')}
								</Button>
							</div>
						) : null}
					</div>

					<div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
						{visible.length === 0 ? (
							<EmptyState icon={SquareSlash} title={t('emptyTitle')} description={t('emptyBody')} />
						) : (
							<div className="overflow-x-auto">
								<table className="w-full min-w-220 border-collapse text-left">
									<thead>
										<tr className="border-b border-border text-overline text-text-muted uppercase">
											<th className="w-10 py-3 pl-4">
												<Checkbox
													checked={allChecked}
													onCheckedChange={(next) => {
														setSelected(next === true ? visibleIds : []);
													}}
													id="select-all-commands"
												/>
												<label htmlFor="select-all-commands" className="sr-only">
													{t('selectAll')}
												</label>
											</th>
											<th className="px-4 py-3 font-mono font-semibold">{t('columns.command')}</th>
											<th className="px-4 py-3 font-mono font-semibold">{t('columns.category')}</th>
											<th className="px-4 py-3 text-right font-mono font-semibold">
												{t('columns.uses')}
											</th>
											<th className="px-4 py-3 font-mono font-semibold">{t('columns.cooldown')}</th>
											<th className="px-4 py-3 font-mono font-semibold">{t('columns.access')}</th>
											<th className="w-16 px-4 py-3 font-mono font-semibold">{t('columns.on')}</th>
										</tr>
									</thead>
									<tbody>
										{visible.map((command) => (
											<tr key={command.id} className="border-b border-border last:border-0">
												<td className="py-3 pl-4 align-top">
													<Checkbox
														checked={selected.includes(command.id)}
														onCheckedChange={(next) => {
															setSelected((current) =>
																next === true
																	? [...current, command.id]
																	: current.filter((id) => id !== command.id)
															);
														}}
														id={`select-${command.id}`}
													/>
													<label htmlFor={`select-${command.id}`} className="sr-only">
														{t('selectOne', { name: command.name })}
													</label>
												</td>
												<td className="px-4 py-3 align-top">
													<p className="font-mono text-body">/{command.name}</p>
													<p className="text-caption font-normal text-text-muted">
														{command.description}
													</p>
												</td>
												<td className="px-4 py-3 align-top">
													<Badge variant="outline">{command.category}</Badge>
												</td>
												<td className="tabular px-4 py-3 text-right align-top text-body-sm text-text-muted">
													{formatCount(command.uses7d)}
												</td>
												<td className="px-4 py-3 align-top">
													<CooldownCell
														command={command}
														onChange={(seconds) => {
															update(command.id, { cooldownSeconds: seconds });
														}}
													/>
												</td>
												<td className="px-4 py-3 align-top">
													<RestrictCell
														command={command}
														roles={roles}
														channels={channels}
														onChange={(patch) => {
															update(command.id, patch);
														}}
													/>
												</td>
												<td className="px-4 py-3 align-top">
													<Switch
														checked={command.enabled}
														onCheckedChange={(next) => {
															update(command.id, { enabled: next });
														}}
														id={`toggle-${command.id}`}
													/>
													<label htmlFor={`toggle-${command.id}`} className="sr-only">
														{t('enableOne', { name: command.name })}
													</label>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function CategoryButton({
	label,
	count,
	active,
	onClick
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-body-sm transition-colors duration-120 ease-out',
				active
					? 'bg-primary-subtle text-primary'
					: 'text-text-muted hover:bg-surface-hover hover:text-text'
			)}
		>
			<span className="min-w-0 flex-1 truncate text-left">{label}</span>
			<span className="tabular font-mono text-caption text-text-muted">{count}</span>
		</button>
	);
}

function CooldownCell({
	command,
	onChange
}: {
	command: BotCommand;
	onChange: (seconds: number) => void;
}) {
	const t = useTranslations('commands');
	const [open, setOpen] = useState(false);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			className="w-64"
			triggerAsChild
			trigger={
				<Button variant="ghost" size="sm" className="font-mono">
					{cooldownLabel(command.cooldownSeconds)}
				</Button>
			}
		>
			<Field label={t('drawer.cooldown')} hint={t('drawer.cooldownHint')}>
				<NumberInput
					value={command.cooldownSeconds}
					onValueChange={onChange}
					min={0}
					max={86400}
					step={5}
				/>
			</Field>
		</Popover>
	);
}

function RestrictCell({
	command,
	roles,
	channels,
	onChange
}: {
	command: BotCommand;
	roles: Role[];
	channels: Channel[];
	onChange: (patch: Partial<BotCommand>) => void;
}) {
	const t = useTranslations('commands');
	const [open, setOpen] = useState(false);

	function accessLabel(): string {
		const restriction = readRestriction(command, roles, channels);
		if (restriction.kind === 'open') return t('access.open');

		const who =
			restriction.role ??
			(restriction.roles > 0
				? t('access.roles', { count: restriction.roles })
				: t('access.everyone'));

		return restriction.channels === 0
			? who
			: who + t('access.except', { count: restriction.channels });
	}

	const restricted = command.allowedRoleIds.length > 0 || command.deniedChannelIds.length > 0;

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			align="end"
			className="w-80 max-w-none"
			triggerAsChild
			trigger={
				<Button variant="ghost" size="sm" className="max-w-52">
					<SlidersHorizontal aria-hidden="true" />
					<span className="min-w-0 truncate">{accessLabel()}</span>
				</Button>
			}
		>
			<div className="flex flex-col gap-3">
				<Field label={t('drawer.roles')} hint={t('drawer.rolesHint')}>
					<RolePicker
						roles={roles}
						value={command.allowedRoleIds}
						onValueChange={(next) => {
							onChange({ allowedRoleIds: next });
						}}
						placeholder={t('drawer.rolesPlaceholder')}
					/>
				</Field>

				<Field label={t('drawer.channel')} hint={t('drawer.channelHint')}>
					<ChannelPicker
						channels={channels}
						value={command.deniedChannelIds[0] ?? null}
						onValueChange={(next) => {
							onChange({ deniedChannelIds: [next] });
						}}
						placeholder={t('drawer.channelPlaceholder')}
					/>
				</Field>

				{restricted ? (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							onChange({ allowedRoleIds: [], deniedChannelIds: [] });
						}}
					>
						Clear restrictions
					</Button>
				) : null}
			</div>
		</Popover>
	);
}
