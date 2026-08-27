import type { Metadata } from 'next';
import { LogoutScreen } from './LogoutScreen';

export const metadata: Metadata = { title: 'Signing out' };

export default function Page() {
	return <LogoutScreen />;
}
