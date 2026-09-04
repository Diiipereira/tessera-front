'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LOCALE_SHORT_NAMES } from '@/lib/locale';
import { rememberLocale } from '@/lib/locale-client';
import { cn } from '@/lib/utils/cn';

const base =
	'grid h-11 place-items-center rounded-sm px-2.5 font-mono text-caption font-normal transition-colors duration-120 ease-out sm:h-7';

const states = {
	active: 'bg-primary-subtle text-primary',
	idle: 'text-text-muted hover:text-text'
};

export function LocaleToggle({ className }: { className?: string }) {
	const t = useTranslations('shell');
	const names = useTranslations('locales');
	const current = useLocale();
	const router = useRouter();

	return (
		<div
			className={cn(
				'flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5',
				className
			)}
			role="group"
			aria-label={t('language')}
		>
			{LOCALE_SHORT_NAMES.map((option) => {
				const active = option.locale === current;

				return (
					<button
						key={option.locale}
						type="button"
						aria-label={t('switchTo', { language: names(option.locale) })}
						aria-pressed={active}
						className={cn(base, active ? states.active : states.idle)}
						onClick={() => {
							if (active) return;

							rememberLocale(option.locale);
							router.refresh();
						}}
					>
						{option.short}
					</button>
				);
			})}
		</div>
	);
}
