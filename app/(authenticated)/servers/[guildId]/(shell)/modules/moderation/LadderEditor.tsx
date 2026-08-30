'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { addRule, loadLadder, removeRule, type EscalationRule } from '@/lib/escalation-client';
import {
	AUTO_ACTIONS,
	TIMEOUT_KEYS,
	type AutoAction,
	type TimeoutKey
} from '@/lib/modules/moderation';

const TIMED_ACTIONS: readonly AutoAction[] = ['timeout', 'mute'];

const SECONDS: Readonly<Record<TimeoutKey, number>> = {
	'60s': 60,
	'5m': 300,
	'10m': 600,
	'1h': 3600,
	'1d': 86400,
	'1w': 604800,
	'2w': 1209600,
	'28d': 2419200
};

const keyOf = (seconds: number): TimeoutKey | null =>
	TIMEOUT_KEYS.find((key) => SECONDS[key] === seconds) ?? null;

const asAction = (value: string): AutoAction =>
	AUTO_ACTIONS.find((entry) => entry === value) ?? 'warn';

const asKey = (value: string): TimeoutKey => TIMEOUT_KEYS.find((entry) => entry === value) ?? '1h';

export function LadderEditor({ guildId, canWrite }: { guildId: string; canWrite: boolean }) {
	const t = useTranslations('modules.moderation.ladder');
	const actions = useTranslations('cases.action');
	const durations = useTranslations('durations');

	const [rules, setRules] = useState<EscalationRule[] | null>(null);
	const [windowDays, setWindowDays] = useState(30);
	const [threshold, setThreshold] = useState('3');
	const [action, setAction] = useState<AutoAction>('timeout');
	const [duration, setDuration] = useState<TimeoutKey>('1h');
	const [busy, setBusy] = useState(false);

	const refresh = (): void => {
		void loadLadder(guildId).then((result) => {
			if (result.status === 'error') {
				setRules([]);
				return;
			}

			setRules(result.ladder.rules);
			setWindowDays(result.ladder.windowDays);
		});
	};

	useEffect(refresh, [guildId]);

	const add = (): void => {
		const points = Number.parseInt(threshold, 10);

		if (!Number.isInteger(points) || points < 1) {
			toast.error(t('badPoints'));
			return;
		}

		setBusy(true);

		void addRule(guildId, {
			threshold: points,
			action,
			durationSeconds: TIMED_ACTIONS.includes(action) ? SECONDS[duration] : null
		}).then((result) => {
			setBusy(false);

			if (result.status === 'error') {
				toast.error(t('addFailed'), { description: result.message });
				return;
			}

			refresh();
		});
	};

	const drop = (rung: EscalationRule): void => {
		setBusy(true);

		void removeRule(guildId, rung.threshold).then((result) => {
			setBusy(false);

			if (result.status === 'error') {
				toast.error(t('removeFailed'), { description: result.message });
				return;
			}

			refresh();
		});
	};

	return (
		<div className="flex flex-col gap-3">
			<p className="text-body-sm text-text-muted">{t('counting', { days: windowDays })}</p>

			{rules === null ? (
				<p className="text-body-sm text-text-muted">{t('loading')}</p>
			) : rules.length === 0 ? (
				<p className="text-body-sm text-text-muted">{t('empty')}</p>
			) : (
				<ul className="flex flex-col gap-1">
					{rules.map((rung) => {
						const key = rung.durationSeconds === null ? null : keyOf(rung.durationSeconds);

						return (
							<li
								key={rung.id}
								className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
							>
								<span className="text-body-sm">
									{key === null
										? t('rung', { points: rung.threshold, action: actions(rung.action) })
										: t('rungWithDuration', {
												points: rung.threshold,
												action: actions(rung.action),
												duration: durations(key)
											})}
								</span>

								{canWrite ? (
									<Button
										variant="ghost"
										size="sm"
										disabled={busy}
										aria-label={t('remove', { points: rung.threshold })}
										onClick={() => {
											drop(rung);
										}}
									>
										<Trash2 className="size-4" aria-hidden />
									</Button>
								) : null}
							</li>
						);
					})}
				</ul>
			)}

			{canWrite ? (
				<div className="flex flex-wrap items-end gap-3">
					<Field label={t('points')} className="w-28">
						<Input
							value={threshold}
							inputMode="numeric"
							onChange={(event) => {
								setThreshold(event.target.value);
							}}
						/>
					</Field>

					<Field label={t('action')} className="w-44">
						<Select
							options={AUTO_ACTIONS.map((value) => ({ value, label: actions(value) }))}
							value={action}
							onValueChange={(next) => {
								setAction(asAction(next));
							}}
						/>
					</Field>

					{TIMED_ACTIONS.includes(action) ? (
						<Field label={t('duration')} className="w-40">
							<Select
								options={TIMEOUT_KEYS.map((value) => ({ value, label: durations(value) }))}
								value={duration}
								onValueChange={(next) => {
									setDuration(asKey(next));
								}}
							/>
						</Field>
					) : null}

					<Button variant="secondary" disabled={busy} onClick={add}>
						{t('add')}
					</Button>
				</div>
			) : null}
		</div>
	);
}
