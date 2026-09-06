'use client';

import { Check, ChevronsUpDown, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { Popover } from '@/components/ui/Popover';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFieldState } from '@/components/ui/field-context';
import type { Role } from '@/lib/types/discord';
import { cn } from '@/lib/utils/cn';
import { formatCount } from '@/lib/utils/format';

const row =
	'flex h-8 w-full items-center gap-2 rounded-sm px-2 text-body transition-colors duration-120 ease-out';

type RolePickerProps = {
	roles: Role[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	placeholder?: string;
	max?: number;
	id?: string;
};

export function RolePicker({
	roles,
	value = [],
	onValueChange,
	placeholder,
	max,
	id
}: RolePickerProps) {
	const t = useTranslations('pickers');
	const field = useFieldState();
	const [open, setOpen] = useState(false);

	const selected = roles.filter((role) => value.includes(role.id));
	const full = max !== undefined && value.length >= max;

	function blocks(role: Role): boolean {
		return full && !value.includes(role.id);
	}

	function toggle(role: Role) {
		if (role.lockedReason) return;

		if (blocks(role)) {
			toast.info(t('roleLimit', { max: max ?? 0 }), { id: 'role-picker-limit' });
			return;
		}

		onValueChange?.(
			value.includes(role.id) ? value.filter((entry) => entry !== role.id) : [...value, role.id]
		);
	}

	const trigger = (
		<>
			{selected.length === 0 ? (
				<span id={id ?? field?.controlId} className="min-w-0 flex-1 text-left text-text-muted">
					{placeholder ?? t('roles')}
				</span>
			) : (
				<>
					<span id={id ?? field?.controlId} className="contents">
						{selected.map((role) => (
							<span
								key={role.id}
								className="inline-flex h-6 items-center gap-1.5 rounded-sm border border-border bg-surface-sunken px-2 text-body-sm"
							>
								<span
									aria-hidden="true"
									className="size-2 shrink-0 rounded-full"
									style={{ backgroundColor: role.color }}
								/>
								{role.name}
							</span>
						))}
					</span>
					<span className="flex-1" />
				</>
			)}
			<ChevronsUpDown className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
		</>
	);

	function optionButton(role: Role): ReactElement {
		const isSelected = value.includes(role.id);
		const unreachable = Boolean(role.lockedReason) || blocks(role);

		return (
			<button
				type="button"
				aria-pressed={isSelected}
				aria-disabled={unreachable ? true : undefined}
				className={cn(
					row,
					unreachable
						? 'cursor-not-allowed text-text-muted opacity-50'
						: isSelected
							? 'bg-primary-subtle text-text'
							: 'text-text hover:bg-surface-hover'
				)}
				onClick={() => {
					toggle(role);
				}}
			>
				<span
					aria-hidden="true"
					className="size-2 shrink-0 rounded-full"
					style={{ backgroundColor: role.color }}
				/>
				<span className="min-w-0 flex-1 truncate text-left">{role.name}</span>
				{role.memberCount === undefined ? null : (
					<span className="tabular shrink-0 text-caption font-normal text-text-muted">
						{formatCount(role.memberCount)}
					</span>
				)}
				{role.lockedReason ? (
					<Lock className="size-3.5 shrink-0 text-warning" aria-hidden="true" />
				) : isSelected ? (
					<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
				) : null}
			</button>
		);
	}

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			modal
			align="start"
			className="w-(--radix-popover-trigger-width) max-w-none p-1"
			triggerClassName="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-body text-text transition-colors duration-120 ease-out focus-visible:border-primary focus-visible:outline-none hover:border-border-strong data-[state=open]:border-primary"
			trigger={trigger}
		>
			{max === undefined ? null : (
				<p
					aria-live="polite"
					className={cn(
						'tabular border-b border-border px-2 py-1.5 text-caption font-normal',
						full ? 'text-warning-fg' : 'text-text-muted'
					)}
				>
					{t('roleCount', { count: value.length, max })}
				</p>
			)}

			<div className="max-h-70 thin-scroll overflow-y-auto overscroll-contain">
				{roles.map((role) =>
					role.lockedReason ? (
						<Tooltip key={role.id} content={role.lockedReason} side="right" asChild>
							{optionButton(role)}
						</Tooltip>
					) : (
						<div key={role.id} className="contents">
							{optionButton(role)}
						</div>
					)
				)}
			</div>
		</Popover>
	);
}
