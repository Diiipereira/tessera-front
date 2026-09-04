import type { ReactNode } from 'react';
import { Alert, type AlertVariant } from '@/components/ui/Alert';

export function Callout({
	tone = 'info',
	title,
	children
}: {
	tone?: AlertVariant;
	title: string;
	children?: ReactNode;
}) {
	return (
		<Alert variant={tone} title={title}>
			{children}
		</Alert>
	);
}
