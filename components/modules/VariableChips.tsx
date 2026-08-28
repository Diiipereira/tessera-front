'use client';

import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/ui/Popover';
import type { MessageVariable } from '@/lib/types/modules';

type VariableChipsProps = {
	variables: MessageVariable[];
	onInsert: (token: string) => void;
};

export function VariableChips({ variables, onInsert }: VariableChipsProps) {
	const t = useTranslations('modules.variables');

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			<span className="mr-1 font-mono text-overline text-text-muted uppercase">{t('insert')}</span>

			{variables.map((variable) => (
				<button
					key={variable.token}
					type="button"
					title={variable.description}
					onClick={() => {
						onInsert(variable.token);
					}}
					className="inline-flex h-6 items-center rounded-sm border border-border bg-surface-sunken px-2 font-mono text-caption font-normal text-text-muted transition-colors duration-120 ease-out hover:border-primary hover:bg-primary-subtle hover:text-primary"
				>
					{variable.token}
				</button>
			))}

			<Popover
				align="end"
				triggerClassName="grid size-6 place-items-center rounded-sm text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
				className="w-80 max-w-none p-0"
				trigger={
					<>
						<CircleHelp className="size-4" aria-hidden="true" />
						<span className="sr-only">{t('help')}</span>
					</>
				}
			>
				<div className="border-b border-border px-3 py-2">
					<p className="text-body-sm font-medium">{t('title')}</p>
					<p className="text-caption font-normal text-text-muted">{t('body')}</p>
				</div>
				<ul className="max-h-70 overflow-y-auto p-1">
					{variables.map((variable) => (
						<li key={variable.token} className="flex flex-col gap-0.5 rounded-sm px-2 py-1.5">
							<span className="font-mono text-caption font-normal text-primary">
								{variable.token}
							</span>
							<span className="text-caption font-normal text-text-muted">
								{variable.description} &mdash;{' '}
								<span className="font-mono text-text">{variable.sample}</span>
							</span>
						</li>
					))}
				</ul>
			</Popover>
		</div>
	);
}
