import type { Metadata } from 'next';
import { LegalPage } from '../LegalPage';

export const metadata: Metadata = { title: 'Terms' };

export default function Page() {
	return <LegalPage title="Terms" />;
}
