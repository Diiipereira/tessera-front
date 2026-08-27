import { mockBilling } from '@/lib/mock';
import { BillingScreen } from './BillingScreen';

export const metadata = { title: 'Billing' };

export default function Page() {
	return <BillingScreen billing={mockBilling} />;
}
