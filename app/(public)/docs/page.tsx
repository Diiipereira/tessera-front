import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { docsHref } from '@/lib/docs/route';
import { LOCALE_COOKIE, toLocale } from '@/lib/locale';

export default async function Page() {
	const store = await cookies();

	redirect(docsHref(toLocale(store.get(LOCALE_COOKIE)?.value), ''));
}
