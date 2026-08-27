import type { Metadata } from 'next';
import { LegalPage } from '../LegalPage';

export const metadata: Metadata = { title: 'Privacy policy' };

export default function Page() {
	return <LegalPage title="Privacy policy" />;
}
