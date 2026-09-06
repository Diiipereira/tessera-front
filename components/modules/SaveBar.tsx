'use client';

import { Info, TriangleAlert, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useNavigationRefusals } from '@/components/providers/navigation-blocker-context';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import type { ConflictChoice, SaveState } from '@/lib/hooks/useConfigDraft';

type SaveBarProps = {
	dirty: boolean;
	changedCount: number;
	state: SaveState;
	onDiscard: () => void;
	onSave: () => void;
	onResolveConflict: (choice: ConflictChoice) => void;
	variant?: 'floating' | 'inline';
	className?: string;
};

const SHAPE = {
	floating:
		'sticky bottom-4 z-30 mx-auto mt-8 w-full max-w-2xl rounded-xl border bg-surface-raised px-5 shadow-3 sm:bottom-6',
	inline: 'border-t bg-surface-raised px-5'
} as const;

const SHAKE: Keyframe[] = [
	{ transform: 'translateX(0)' },
	{ transform: 'translateX(-7px)', offset: 0.3 },
	{ transform: 'translateX(7px)', offset: 0.5 },
	{ transform: 'translateX(-5px)', offset: 0.7 },
	{ transform: 'translateX(0)' }
];

const ALARM_MS = 3_000;
const LEAVE_MS = 200;

export function SaveBar({
	dirty,
	changedCount,
	state,
	onDiscard,
	onSave,
	onResolveConflict,
	variant = 'floating',
	className
}: SaveBarProps) {
	const t = useTranslations('modules.save');
	const refusals = useNavigationRefusals();
	const card = useRef<HTMLDivElement>(null);

	const conflict = state === 'conflict';
	const wanted = dirty || conflict;

	const [seenRefusals, setSeenRefusals] = useState(refusals);
	const [alarmed, setAlarmed] = useState(false);
	const [present, setPresent] = useState(wanted);
	const [shownCount, setShownCount] = useState(changedCount);

	if (seenRefusals !== refusals) {
		setSeenRefusals(refusals);
		setAlarmed(true);
	}

	if (wanted && !present) setPresent(true);

	if (wanted && shownCount !== changedCount) setShownCount(changedCount);

	useEffect(() => {
		const node = card.current;

		if (refusals === 0 || node === null) return;

		node.scrollIntoView({ block: 'nearest' });

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		node.animate(SHAKE, { duration: 400, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' });
	}, [refusals]);

	useEffect(() => {
		if (!alarmed) return;

		const timer = setTimeout(() => {
			setAlarmed(false);
		}, ALARM_MS);

		return () => {
			clearTimeout(timer);
		};
	}, [alarmed, refusals]);

	useEffect(() => {
		if (wanted || !present) return;

		const timer = setTimeout(() => {
			setPresent(false);
		}, LEAVE_MS);

		return () => {
			clearTimeout(timer);
		};
	}, [wanted, present]);

	if (!present) return null;

	const saving = state === 'saving';

	return (
		<div
			ref={card}
			role="region"
			aria-label={t('region')}
			className={cn(
				SHAPE[variant],
				wanted ? 'animate-rise' : 'animate-fall',
				alarmed
					? 'border-danger'
					: variant === 'floating'
						? 'border-border-strong'
						: 'border-border',
				className
			)}
		>
			<div className="flex h-16 items-center gap-4">
				{conflict ? (
					<>
						<Info className="size-5 shrink-0 text-info" aria-hidden="true" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-body font-medium text-info-fg">{t('conflictTitle')}</p>
							<p className="truncate text-caption font-normal text-text-muted">
								{t('conflictBody')}
							</p>
						</div>
						<Button
							variant="outline"
							onClick={() => {
								onResolveConflict('reload');
							}}
						>
							{t('reload')}
						</Button>
						<Button
							onClick={() => {
								onResolveConflict('keep-mine');
							}}
						>
							{t('keepMine')}
						</Button>
					</>
				) : (
					<>
						<TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-body font-medium">{t('unsaved')}</p>
							<p className="tabular truncate text-caption font-normal text-text-muted">
								{t('modified', { count: shownCount })}
							</p>
						</div>
						<Button variant="ghost" disabled={saving} onClick={onDiscard}>
							<Undo2 aria-hidden="true" />
							{t('discard')}
						</Button>
						<Button loading={saving} onClick={onSave}>
							{saving ? t('saving') : t('submit')}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
