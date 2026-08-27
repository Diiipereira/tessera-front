'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/components/providers/theme-context';

export function Toaster() {
	const { resolved } = useTheme();

	return (
		<Sonner
			theme={resolved}
			position="bottom-right"
			closeButton
			toastOptions={{
				classNames: {
					toast:
						'!rounded-lg !border !border-border !bg-surface-raised !text-text !shadow-2 !font-sans',
					title: '!text-body !font-medium',
					description: '!text-body-sm !text-text-muted',
					actionButton: '!bg-primary !text-primary-fg !rounded-md',
					cancelButton: '!bg-surface-sunken !text-text !rounded-md',
					closeButton: '!bg-surface-raised !border-border !text-text-muted',
					success: '![&_[data-icon]]:text-success',
					error: '![&_[data-icon]]:text-danger',
					warning: '![&_[data-icon]]:text-warning',
					info: '![&_[data-icon]]:text-info'
				}
			}}
		/>
	);
}
