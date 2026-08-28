'use client';

import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { Select } from '@/components/ui/Select';
import type { EscalationRule, ModerationAction } from '@/lib/types/modules';
import { newId } from '@/lib/utils/id';

const ACTIONS: ModerationAction[] = ['warn', 'timeout', 'mute', 'kick', 'ban'];

const TIMED = ['10m', '1h', '24h', '7d'] as const;

const INSTANT_ACTIONS: ModerationAction[] = ['warn', 'kick'];

type EscalationTableProps = {
	rules: EscalationRule[];
	onChange: (rules: EscalationRule[]) => void;
};

export function EscalationTable({ rules, onChange }: EscalationTableProps) {
	const t = useTranslations('modules.moderation.escalation');
	const spans = useTranslations('durations');

	const actionOptions = ACTIONS.map((value) => ({ value, label: t(`actions.${value}`) }));

	const durationOptions = [
		...TIMED.map((value) => ({ value, label: spans(value) })),
		{ value: 'permanent', label: t('permanent') }
	];

	const sorted = [...rules].sort((a, b) => a.atWarnings - b.atWarnings);
	const duplicates = sorted.filter(
		(rule, index) => index > 0 && rule.atWarnings === sorted[index - 1]?.atWarnings
	);

	function update(id: string, patch: Partial<EscalationRule>) {
		onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
	}

	function add() {
		const highest = sorted.at(-1)?.atWarnings ?? 0;
		onChange([
			...rules,
			{
				id: newId('rule'),
				atWarnings: highest + 2,
				action: 'timeout',
				duration: '1h'
			}
		]);
	}

	return (
		<div className="flex flex-col gap-3">
			{sorted.length === 0 ? (
				<p className="text-body-sm text-text-muted">{t('empty')}</p>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full min-w-140 border-collapse">
						<thead>
							<tr className="border-b border-border text-left">
								<th className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase">
									{t('at')}
								</th>
								<th className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase">
									{t('action')}
								</th>
								<th className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase">
									{t('duration')}
								</th>
								<th className="pb-2">
									<span className="sr-only">{t('remove')}</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{sorted.map((rule) => {
								const instant = INSTANT_ACTIONS.includes(rule.action);
								return (
									<tr key={rule.id} className="border-b border-border last:border-0">
										<td className="py-2 pr-3 align-top">
											<div className="flex items-center gap-2">
												<NumberInput
													min={1}
													max={99}
													value={rule.atWarnings}
													onValueChange={(next) => {
														update(rule.id, { atWarnings: next });
													}}
													aria-label={t('atLabel')}
													className="tabular w-20"
												/>
												<span className="text-body-sm whitespace-nowrap text-text-muted">
													{t('warnings')}
												</span>
											</div>
										</td>
										<td className="py-2 pr-3 align-top">
											<Select
												options={actionOptions}
												value={rule.action}
												onValueChange={(next) => {
													update(rule.id, { action: next as ModerationAction });
												}}
												className="min-w-36"
											/>
										</td>
										<td className="py-2 pr-3 align-top">
											{instant ? (
												<span className="block py-2 text-body-sm text-text-muted">
													{t('notApplicable')}
												</span>
											) : (
												<Select
													options={durationOptions}
													value={rule.duration}
													onValueChange={(next) => {
														update(rule.id, { duration: next });
													}}
													className="min-w-36"
												/>
											)}
										</td>
										<td className="py-2 align-top">
											<Button
												variant="ghost-danger"
												size="sm"
												iconOnly
												aria-label={t('removeRule', { count: rule.atWarnings })}
												onClick={() => {
													onChange(rules.filter((entry) => entry.id !== rule.id));
												}}
											>
												<Trash2 aria-hidden="true" />
											</Button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{duplicates.length > 0 ? (
				<p className="flex items-center gap-1.5 text-caption font-normal text-warning-fg">
					<TriangleAlert className="size-3.5 shrink-0 text-warning" aria-hidden="true" />
					{t('duplicate')}
				</p>
			) : null}

			<div>
				<Button variant="outline" size="sm" onClick={add}>
					<Plus aria-hidden="true" />
					{t('add')}
				</Button>
			</div>
		</div>
	);
}
