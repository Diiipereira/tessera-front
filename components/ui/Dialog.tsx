'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type DialogSize = 'sm' | 'md' | 'lg';

const sizes: Record<DialogSize, string> = {
	sm: 'max-w-120',
	md: 'max-w-160',
	lg: 'max-w-200'
};

type DialogProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	title: string;
	description?: string;
	size?: DialogSize;
	danger?: boolean;
	trigger?: ReactNode;
	triggerAsChild?: boolean;
	footer?: ReactNode;
	className?: string;
	children: ReactNode;
};

export function Dialog({
	open,
	defaultOpen,
	onOpenChange,
	title,
	description,
	size = 'sm',
	danger = false,
	trigger,
	triggerAsChild = false,
	footer,
	className,
	children
}: DialogProps) {
	return (
		<DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
			{trigger ? (
				<DialogPrimitive.Trigger asChild={triggerAsChild}>{trigger}</DialogPrimitive.Trigger>
			) : null}

			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop" />
				<DialogPrimitive.Content
					className={cn(
						'fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] -translate-1/2 flex-col gap-4 rounded-xl border border-border-strong bg-surface-raised p-6 shadow-3 data-[state=open]:animate-scale-in',
						sizes[size],
						className
					)}
				>
					<div className="flex shrink-0 items-start gap-3">
						<div className="min-w-0 flex-1">
							<DialogPrimitive.Title className={cn('text-h3', danger && 'text-danger')}>
								{title}
							</DialogPrimitive.Title>
							{description ? (
								<DialogPrimitive.Description className="mt-1 text-body-sm text-text-muted">
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

					<div className="-mx-6 min-h-0 min-w-0 flex-auto thin-scroll overflow-y-auto px-6">
						{children}
					</div>

					{footer ? (
						<div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{footer}</div>
					) : null}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
