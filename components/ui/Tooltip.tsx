'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

type TooltipProps = {
	content: string;
	side?: 'top' | 'right' | 'bottom' | 'left';
	asChild?: boolean;
	className?: string;
	children: ReactNode;
};

export function Tooltip({
	content,
	side = 'top',
	asChild = false,
	className,
	children
}: TooltipProps) {
	return (
		<TooltipPrimitive.Root delayDuration={400}>
			<TooltipPrimitive.Trigger asChild={asChild} className={asChild ? undefined : className}>
				{children}
			</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					side={side}
					sideOffset={6}
					className="z-70 max-w-xs rounded-sm bg-tooltip px-2 py-1.5 text-caption font-normal text-tooltip-fg shadow-2 data-[state=delayed-open]:animate-pop"
				>
					{content}
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	);
}
