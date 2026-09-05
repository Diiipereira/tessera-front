import { NextResponse, type NextRequest } from 'next/server';
import { docsHref, DOCS_LOCALE_HEADER, readDocsPath } from '@/lib/docs/route';
import { LOCALE_COOKIE, toLocale } from '@/lib/locale';

const TEMPORARY_REDIRECT = 307;

export const config = { matcher: '/docs/:path+' };

export function proxy(request: NextRequest) {
	const route = readDocsPath(request.nextUrl.pathname);

	if (route.kind === 'outside') return NextResponse.next();

	if (route.kind === 'unprefixed') {
		const locale = toLocale(request.cookies.get(LOCALE_COOKIE)?.value);
		const target = new URL(docsHref(locale, route.slug), request.nextUrl);

		target.search = request.nextUrl.search;

		return NextResponse.redirect(target, TEMPORARY_REDIRECT);
	}

	const headers = new Headers(request.headers);

	headers.set(DOCS_LOCALE_HEADER, route.locale);

	return NextResponse.next({ request: { headers } });
}
