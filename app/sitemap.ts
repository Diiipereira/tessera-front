import type { MetadataRoute } from 'next';
import { ALL_DOC_SLUGS } from '@/content/docs/nav';
import { docsHref, neutralDocsHref } from '@/lib/docs/route';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { absoluteUrl } from '@/lib/site-url';

const PUBLIC_PAGES = ['/', '/pricing', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		...PUBLIC_PAGES.map((path) => ({ url: absoluteUrl(path) })),
		...ALL_DOC_SLUGS.flatMap((slug) =>
			SUPPORTED_LOCALES.map((locale) => ({
				url: absoluteUrl(docsHref(locale, slug)),
				alternates: {
					languages: {
						'pt-BR': absoluteUrl(docsHref('pt-BR', slug)),
						'en-US': absoluteUrl(docsHref('en-US', slug)),
						'x-default': absoluteUrl(neutralDocsHref(slug))
					}
				}
			}))
		)
	];
}
