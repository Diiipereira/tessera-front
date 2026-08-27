'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type PopoverProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	modal?: boolean;
	side?: 'top' | 'right' | 'bottom' | 'left';
	align?: 'start' | 'center' | 'end';
	trigger: ReactNode;
	triggerAsChild?: boolean;
	triggerClassName?: string;
	className?: string;
	children: ReactNode;
};

export function Popover({
	open,
	defaultOpen,
	onOpenChange,
	modal = false,
	side = 'bottom',
	align = 'start',
	trigger,
	triggerAsChild = false,
	triggerClassName,
	className,
	children
}: PopoverProps) {
	return (
		<PopoverPrimitive.Root
			open={open}
			defaultOpen={defaultOpen}
			onOpenChange={onOpenChange}
			modal={modal}
		>
			<PopoverPrimitive.Trigger asChild={triggerAsChild} className={triggerClassName}>
				{trigger}
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content
					side={side}
					align={align}
					sideOffset={4}
					className={cn(
						'z-60 max-w-xs rounded-lg border border-border-strong bg-surface-raised p-3 shadow-2 data-[state=open]:animate-pop',
						className
					)}
				>
					{children}
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	);
}
