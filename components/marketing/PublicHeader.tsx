import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { BrandMark } from '@/components/auth/BrandMark';
import { BRAND } from '@/lib/brand';
import { NAV_LINKS } from '@/lib/marketing';
import { PublicHeaderActions } from './PublicHeaderActions';

const navLink =
	'rounded-md px-2.5 py-1.5 text-body font-medium text-text-muted no-underline transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text hover:no-underline';

export function PublicHeader() {
	const t = useTranslations('marketing.nav');

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-bg/88 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-300 items-center gap-6 px-6 sm:px-8">
				<Link href="/" className="flex shrink-0 items-center gap-2.5 text-text no-underline">
					<BrandMark tone="primary" size="sm" />
					<span className="text-h4">{BRAND.name}</span>
				</Link>

				<nav aria-label={t('main')} className="hidden min-w-0 flex-1 items-center gap-1 md:flex">
					{NAV_LINKS.map((link) =>
						link.external ? (
							<a key={link.id} href={link.href} rel="external" className={navLink}>
								{t(link.id)}
							</a>
						) : (
							<Link key={link.id} href={link.href} className={navLink}>
								{t(link.id)}
							</Link>
						)
					)}
				</nav>

				<PublicHeaderActions />
			</div>
		</header>
	);
}
