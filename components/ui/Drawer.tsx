'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type DrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	header?: ReactNode;
	footer?: ReactNode;
	className?: string;
	children: ReactNode;
};

export function Drawer({
	open,
	onOpenChange,
	title,
	description,
	header,
	footer,
	className,
	children
}: DrawerProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop" />
				<DialogPrimitive.Content
					className={cn(
						'fixed inset-y-0 right-0 z-50 flex w-[min(30rem,100vw)] flex-col border-l border-border-strong bg-surface shadow-3 data-[state=open]:animate-slide-in-right',
						className
					)}
				>
					<div className="flex items-start gap-3 border-b border-border px-5 py-4">
						<div className="min-w-0 flex-1">
							<DialogPrimitive.Title className={cn(header ? 'sr-only' : 'truncate text-h3')}>
								{title}
							</DialogPrimitive.Title>
							{header}
							{description && !header ? (
								<DialogPrimitive.Description className="mt-0.5 truncate text-body-sm text-text-muted">
									{description}
								</DialogPrimitive.Description>
							) : null}
						</div>
						<DialogPrimitive.Close
							aria-label="Close"
							className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
						>
							<X className="size-4" aria-hidden="true" />
						</DialogPrimitive.Close>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>

					{footer ? (
						<div className="border-t border-border bg-surface-sunken px-5 py-4">{footer}</div>
					) : null}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
