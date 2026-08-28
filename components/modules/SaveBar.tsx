'use client';

import { Info, TriangleAlert, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
	className?: string;
};

export function SaveBar({
	dirty,
	changedCount,
	state,
	onDiscard,
	onSave,
	onResolveConflict,
	className
}: SaveBarProps) {
	const t = useTranslations('modules.save');
	const conflict = state === 'conflict';
	if (!dirty && !conflict) return null;

	const saving = state === 'saving';

	return (
		<div
			role="region"
			aria-label={t('region')}
			className={cn(
				'sticky bottom-0 z-30 -mx-6 mt-8 -mb-6 animate-rise border-t border-border-strong bg-surface-raised shadow-3 sm:-mx-8 sm:-mb-8',
				className
			)}
		>
			<div className="flex h-16 items-center gap-4 px-6 sm:px-8">
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
								{t('modified', { count: changedCount })}
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
