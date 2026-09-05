import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { BrandMark } from '@/components/auth/BrandMark';
import { OutboundLink } from '@/components/ui/OutboundLink';
import { BRAND } from '@/lib/brand';
import { FOOTER_COLUMNS } from '@/lib/marketing';
import { MOCK_NOW } from '@/lib/time';

const footerLink = 'text-body-sm text-link';

export function PublicFooter() {
	const t = useTranslations('marketing.footer');

	return (
		<footer>
			<div className="mx-auto max-w-300 px-6 pt-16 pb-8 sm:px-8">
				<div className="grid gap-8 border-b border-border pb-8 sm:grid-cols-2 lg:grid-cols-4">
					<div className="min-w-0">
						<div className="mb-3 flex items-center gap-2.5">
							<BrandMark size="xs" />
							<span className="text-h4">{BRAND.name}</span>
						</div>
						<p className="max-w-[32ch] text-body-sm text-pretty text-text-muted">{t('tagline')}</p>
					</div>

					{FOOTER_COLUMNS.map((column) => (
						<div key={column.id} className="min-w-0">
							<p className="mb-3 font-mono text-overline text-text-muted uppercase">
								{t(column.id)}
							</p>
							<div className="flex flex-col items-start gap-2">
								{column.links.map((link) =>
									link.external ? (
										<OutboundLink key={link.id} href={link.href} className={footerLink}>
											{t(`links.${link.id}`)}
										</OutboundLink>
									) : (
										<Link key={link.id} href={link.href} className={footerLink}>
											{t(`links.${link.id}`)}
										</Link>
									)
								)}
							</div>
						</div>
					))}
				</div>

				<div className="flex flex-wrap items-center gap-4 pt-6">
					<p className="text-caption font-normal text-text-muted">
						© {MOCK_NOW.getUTCFullYear()} {BRAND.name}
					</p>
					<p className="flex items-center gap-2 text-caption font-normal text-text-muted">
						<span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
						{t('status')}
					</p>
				</div>
			</div>
		</footer>
	);
}
