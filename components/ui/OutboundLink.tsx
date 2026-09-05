import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function OutboundLink({
	href,
	className,
	children
}: {
	href: string | null;
	className?: string;
	children: ReactNode;
}) {
	const t = useTranslations('common');

	if (href === null) {
		return (
			<span aria-disabled="true" className={cn(className, 'pointer-events-none opacity-55')}>
				{children}
				<span className="sr-only"> — {t('notAvailable')}</span>
			</span>
		);
	}

	return (
		<a href={href} rel="external" className={className}>
			{children}
		</a>
	);
}
