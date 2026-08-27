'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme, type ThemeMode } from '@/components/providers/theme-context';
import { cn } from '@/lib/utils/cn';

const options: { mode: ThemeMode; labelKey: string; icon: LucideIcon }[] = [
	{ mode: 'light', labelKey: 'lightTheme', icon: Sun },
	{ mode: 'dark', labelKey: 'darkTheme', icon: Moon },
	{ mode: 'system', labelKey: 'systemTheme', icon: Monitor }
];

const base =
	'grid h-11 w-11 place-items-center rounded-sm transition-colors duration-120 ease-out sm:h-7 sm:w-8';

const states = {
	active: 'bg-primary-subtle text-primary',
	idle: 'text-text-muted hover:text-text'
};

export function ThemeToggle() {
	const t = useTranslations('shell');
	const { mode, setMode } = useTheme();

	return (
		<div
			className="flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
			role="group"
			aria-label={t('theme')}
		>
			{options.map((option) => {
				const Icon = option.icon;
				const active = mode === option.mode;
				return (
					<button
						key={option.mode}
						type="button"
						aria-label={t(option.labelKey)}
						aria-pressed={active}
						className={cn(base, active ? states.active : states.idle)}
						onClick={() => {
							setMode(option.mode);
						}}
					>
						<Icon className="size-4" aria-hidden="true" />
					</button>
				);
			})}
		</div>
	);
}
