'use client';

import { Coins, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { RolePicker } from '@/components/discord/RolePicker';
import { Avatar } from '@/components/layout/Avatar';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Role } from '@/lib/types/discord';
import type {
	EconomyConfig,
	ShopItem,
	Transaction,
	TransactionKind
} from '@/lib/types/module-configs';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';
import { formatCount } from '@/lib/utils/format';

const KIND_VARIANTS: Record<TransactionKind, BadgeVariant> = {
	daily: 'success',
	work: 'primary',
	transfer: 'info',
	purchase: 'neutral',
	admin: 'warning'
};

const SYMBOL_PRESETS = ['🪙', '💰', '💎', '⭐', '🍪', '$'];

const ASCII_SYMBOL = /^[!-~]+$/;

const FILTERS: (TransactionKind | 'all')[] = [
	'all',
	'daily',
	'work',
	'transfer',
	'purchase',
	'admin'
];

function CommandGroup({
	command,
	blurb,
	footer,
	children
}: {
	command: string;
	blurb: string;
	footer?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-sunken p-4">
			<div>
				<p className="font-mono text-body-sm font-medium text-primary">{command}</p>
				<p className="mt-0.5 text-caption font-normal text-pretty text-text-muted">{blurb}</p>
			</div>

			<div className="flex flex-wrap items-start gap-4">{children}</div>

			{footer ? <p className="mt-auto text-body-sm text-pretty text-text-muted">{footer}</p> : null}
		</div>
	);
}

function blankItem(): ShopItem {
	return {
		id: newId('item'),
		name: '',
		description: '',
		price: 100,
		roleId: null,
		stock: null,
		perUserLimit: null
	};
}

type EconomyScreenProps = {
	config: EconomyConfig;
	roles: Role[];
	transactions: Transaction[];
};

export function EconomyScreen({ config, roles, transactions }: EconomyScreenProps) {
	const t = useTranslations('modules.economy');
	const form = useConfigDraft<EconomyConfig>(config);
	const draft = form.draft;

	const [editing, setEditing] = useState<ShopItem | null>(null);
	const [isNew, setIsNew] = useState(false);
	const [filter, setFilter] = useState<TransactionKind | 'all'>('all');

	const money = (value: number) => {
		const gap = ASCII_SYMBOL.test(draft.currencySymbol) ? '' : ' ';
		return `${draft.currencySymbol}${gap}${formatCount(Math.abs(value))}`;
	};
	const visible =
		filter === 'all' ? transactions : transactions.filter((entry) => entry.kind === filter);

	function commitItem(item: ShopItem) {
		const exists = draft.shop.some((entry) => entry.id === item.id);
		form.set(
			'shop',
			exists
				? draft.shop.map((entry) => (entry.id === item.id ? item : entry))
				: [...draft.shop, item]
		);
		setEditing(null);
	}

	return (
		<ModulePage
			moduleId="economy"
			icon={Coins}
			title={t('title')}
			description={t('description')}
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(() => {
							toast.success(t('saved'));
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection title={t('currency.title')}>
				<div className="flex flex-wrap items-start gap-4">
					<Field label={t('currency.name')} className="w-48">
						<Input
							value={draft.currencyName}
							onChange={(event) => {
								form.set('currencyName', event.target.value);
							}}
							placeholder={t('currency.namePlaceholder')}
						/>
					</Field>
					<Field label={t('currency.symbol')} help={t('currency.symbolHelp')} className="w-28">
						<Input
							value={draft.currencySymbol}
							onChange={(event) => {
								form.set('currencySymbol', event.target.value);
							}}
							maxLength={3}
							className="text-center font-mono"
						/>
					</Field>
					<Field label={t('currency.starting')} className="w-40">
						<NumberInput
							min={0}
							max={1000000}
							leading={draft.currencySymbol}
							value={draft.startingBalance}
							onValueChange={(next) => {
								form.set('startingBalance', next);
							}}
						/>
					</Field>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<span className="text-caption font-normal text-text-muted">{t('currency.presets')}</span>
					{SYMBOL_PRESETS.map((preset) => {
						const active = draft.currencySymbol === preset;
						return (
							<button
								key={preset}
								type="button"
								aria-pressed={active}
								aria-label={t('currency.usePreset', { symbol: preset })}
								className={cn(
									'grid size-8 place-items-center rounded-md border text-body transition-colors duration-120 ease-out',
									active
										? 'border-primary bg-primary-subtle'
										: 'border-border bg-surface hover:border-border-strong'
								)}
								onClick={() => {
									form.set('currencySymbol', preset);
								}}
							>
								{preset}
							</button>
						);
					})}
				</div>

				<p className="text-body-sm text-text-muted">
					{t.rich('currency.starts', {
						amount: money(draft.startingBalance),
						name: draft.currencyName,
						b: (chunks) => <span className="font-medium text-text">{chunks}</span>
					})}
				</p>
			</SettingsSection>

			<SettingsSection title={t('earning.title')} description={t('earning.description')}>
				<div className="grid gap-4 lg:grid-cols-2">
					<CommandGroup
						command="/daily"
						blurb={t('earning.dailyBlurb')}
						footer={
							draft.streakBonus === 0
								? t.rich('earning.flat', {
										daily: money(draft.dailyAmount),
										week: money(draft.dailyAmount * 7),
										b: (chunks) => <span className="font-medium text-text">{chunks}</span>
									})
								: t.rich('earning.stacking', {
										daily: money(draft.dailyAmount),
										seventh: money(draft.dailyAmount + draft.streakBonus * 6),
										week: money(draft.dailyAmount * 7 + draft.streakBonus * 21),
										b: (chunks) => <span className="font-medium text-text">{chunks}</span>
									})
						}
					>
						<Field label={t('earning.amount')} className="w-32">
							<NumberInput
								min={0}
								max={100000}
								leading={draft.currencySymbol}
								value={draft.dailyAmount}
								onValueChange={(next) => {
									form.set('dailyAmount', next);
								}}
							/>
						</Field>
						<Field label={t('earning.cooldownHours')} className="w-40">
							<NumberInput
								min={1}
								max={168}
								value={draft.dailyCooldownHours}
								onValueChange={(next) => {
									form.set('dailyCooldownHours', next);
								}}
							/>
						</Field>
						<Field label={t('earning.streak')} className="w-36">
							<NumberInput
								min={0}
								max={10000}
								leading={draft.currencySymbol}
								value={draft.streakBonus}
								onValueChange={(next) => {
									form.set('streakBonus', next);
								}}
							/>
						</Field>
					</CommandGroup>

					<CommandGroup command="/work" blurb={t('earning.workBlurb')}>
						<Field label={t('earning.amount')} className="w-32">
							<NumberInput
								min={0}
								max={100000}
								leading={draft.currencySymbol}
								value={draft.workAmount}
								onValueChange={(next) => {
									form.set('workAmount', next);
								}}
							/>
						</Field>
						<Field label={t('earning.cooldownMinutes')} className="w-44">
							<NumberInput
								min={1}
								max={1440}
								value={draft.workCooldownMinutes}
								onValueChange={(next) => {
									form.set('workCooldownMinutes', next);
								}}
							/>
						</Field>
					</CommandGroup>
				</div>
			</SettingsSection>

			<SettingsSection title={t('transfers.title')} description={t('transfers.description')}>
				<CommandGroup
					command="/pay"
					blurb={t('transfers.blurb')}
					footer={
						draft.transferTaxPercent === 0 ? (
							t('transfers.free')
						) : (
							<>
								Of every <span className="font-medium text-text">{money(100)}</span> sent,{' '}
								<span className="font-medium text-text">{money(draft.transferTaxPercent)}</span> is
								burned and{' '}
								<span className="font-medium text-text">
									{money(100 - draft.transferTaxPercent)}
								</span>{' '}
								arrives.
							</>
						)
					}
				>
					<Field label={t('transfers.tax')} className="w-36">
						<NumberInput
							min={0}
							max={100}
							value={draft.transferTaxPercent}
							onValueChange={(next) => {
								form.set('transferTaxPercent', next);
							}}
						/>
					</Field>
				</CommandGroup>
			</SettingsSection>

			<SettingsSection
				title={t('shop.title')}
				description={t('shop.description')}
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditing(blankItem());
							setIsNew(true);
						}}
					>
						<Plus aria-hidden="true" />
						Add item
					</Button>
				}
			>
				{draft.shop.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('shop.empty')}</p>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
						{draft.shop.map((item) => {
							const role = roles.find((entry) => entry.id === item.roleId);
							return (
								<div
									key={item.id}
									className="flex flex-col gap-2 rounded-lg border border-border bg-surface-sunken p-4"
								>
									<div className="flex items-start gap-2">
										<h3 className="min-w-0 flex-1 truncate text-body font-medium">
											{item.name === '' ? t('shop.untitled') : item.name}
										</h3>
										<span className="tabular shrink-0 text-body font-semibold text-primary">
											{money(item.price)}
										</span>
									</div>

									<p className="min-h-10 text-body-sm text-pretty text-text-muted">
										{item.description}
									</p>

									<div className="flex flex-wrap gap-1.5">
										{role ? (
											<Badge variant="primary">
												<span
													aria-hidden="true"
													className="size-2 shrink-0 rounded-full"
													style={{ backgroundColor: role.color }}
												/>
												{role.name}
											</Badge>
										) : null}
										{item.stock === null ? null : (
											<Badge variant={item.stock === 0 ? 'danger' : 'neutral'}>
												{t('shop.stockLeft', { count: item.stock })}
											</Badge>
										)}
										{item.perUserLimit === null ? null : (
											<Badge variant="neutral">
												{t('shop.perUser', { count: item.perUserLimit })}
											</Badge>
										)}
									</div>

									<div className="mt-auto flex items-center gap-1 pt-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setEditing(item);
												setIsNew(false);
											}}
										>
											<Pencil aria-hidden="true" />
											{t('shop.edit')}
										</Button>
										<div className="flex-1" />
										<Button
											variant="ghost-danger"
											size="sm"
											iconOnly
											aria-label={t('shop.remove', {
												name: item.name === '' ? t('shop.untitled') : item.name
											})}
											onClick={() => {
												form.set(
													'shop',
													draft.shop.filter((entry) => entry.id !== item.id)
												);
											}}
										>
											<Trash2 aria-hidden="true" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</SettingsSection>

			<SettingsSection
				title={t('transactions.title')}
				description={t('transactions.description')}
				action={
					<SegmentedControl
						options={FILTERS.map((value) => ({ value, label: t(`transactions.${value}`) }))}
						value={filter}
						onValueChange={setFilter}
						label={t('transactions.filter')}
						size="sm"
					/>
				}
			>
				{visible.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('transactions.empty')}</p>
				) : (
					<ul className="flex flex-col">
						{visible.map((entry) => (
							<li
								key={entry.id}
								className="flex items-center gap-3 border-b border-border py-3 last:border-0"
							>
								<Avatar
									initials={entry.actorInitials}
									color={entry.actorColor}
									shape="circle"
									size="sm"
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-body-sm">
										<span className="font-medium">{entry.actorName}</span> &mdash; {entry.note}
									</p>
									<span className="text-caption font-normal text-text-muted">{entry.at}</span>
								</div>
								<Badge variant={KIND_VARIANTS[entry.kind]} className="shrink-0">
									{t(`kind.${entry.kind}`)}
								</Badge>
								<span
									className={cn(
										'tabular w-24 shrink-0 text-right text-body font-medium',
										entry.amount < 0 ? 'text-danger-fg' : 'text-success-fg'
									)}
								>
									{entry.amount < 0 ? '−' : '+'}
									{money(entry.amount)}
								</span>
							</li>
						))}
					</ul>
				)}
			</SettingsSection>

			{editing ? (
				<ItemDialog
					item={editing}
					isNew={isNew}
					roles={roles}
					symbol={draft.currencySymbol}
					onCancel={() => {
						setEditing(null);
					}}
					onSave={commitItem}
				/>
			) : null}
		</ModulePage>
	);
}

type ItemDialogProps = {
	item: ShopItem;
	isNew: boolean;
	roles: Role[];
	symbol: string;
	onCancel: () => void;
	onSave: (item: ShopItem) => void;
};

function ItemDialog({ item, isNew, roles, symbol, onCancel, onSave }: ItemDialogProps) {
	const t = useTranslations('modules.economy.item');
	const shared = useTranslations('common');
	const [work, setWork] = useState(item);
	const [limitedStock, setLimitedStock] = useState(item.stock !== null);
	const [limitedPerUser, setLimitedPerUser] = useState(item.perUserLimit !== null);

	function patch(values: Partial<ShopItem>) {
		setWork((current) => ({ ...current, ...values }));
	}

	return (
		<Dialog
			open
			onOpenChange={(next) => {
				if (!next) onCancel();
			}}
			title={isNew ? t('new') : t('edit')}
			size="md"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						{shared('cancel')}
					</Button>
					<Button
						disabled={work.name.trim() === ''}
						onClick={() => {
							onSave({
								...work,
								stock: limitedStock ? (work.stock ?? 1) : null,
								perUserLimit: limitedPerUser ? (work.perUserLimit ?? 1) : null
							});
						}}
					>
						{isNew ? t('add') : t('save')}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<Field label={t('name')} required>
					<Input
						value={work.name}
						onChange={(event) => {
							patch({ name: event.target.value });
						}}
						placeholder={t('namePlaceholder')}
					/>
				</Field>

				<Field label={t('description')}>
					<Textarea
						value={work.description}
						onChange={(event) => {
							patch({ description: event.target.value });
						}}
						className="min-h-16"
						maxLength={200}
						showCount
					/>
				</Field>

				<Field label={t('price')} className="w-40">
					<NumberInput
						min={0}
						max={10000000}
						leading={symbol}
						value={work.price}
						onValueChange={(next) => {
							patch({ price: next });
						}}
					/>
				</Field>

				<Field label={t('role')} hint={t('roleHint')}>
					<RolePicker
						roles={roles}
						value={work.roleId === null ? [] : [work.roleId]}
						onValueChange={(next) => {
							patch({ roleId: next.at(-1) ?? null });
						}}
						placeholder={t('rolePlaceholder')}
					/>
				</Field>

				<div className="flex flex-col gap-3">
					<Switch
						checked={limitedStock}
						onCheckedChange={setLimitedStock}
						label={t('limitedStock')}
						description={t('limitedStockHint')}
					/>
					{limitedStock ? (
						<NumberInput
							min={0}
							max={100000}
							value={work.stock ?? 1}
							onValueChange={(next) => {
								patch({ stock: next });
							}}
							aria-label={t('stock')}
							className="w-32"
						/>
					) : null}

					<Switch
						checked={limitedPerUser}
						onCheckedChange={setLimitedPerUser}
						label={t('perUserLimit')}
					/>
					{limitedPerUser ? (
						<NumberInput
							min={1}
							max={100}
							value={work.perUserLimit ?? 1}
							onValueChange={(next) => {
								patch({ perUserLimit: next });
							}}
							aria-label={t('perUserLabel')}
							className="w-32"
						/>
					) : null}
				</div>
			</div>
		</Dialog>
	);
}
