'use client';

import { LoaderCircle } from 'lucide-react';
import { DiscordLogo } from './DiscordLogo';
import { cn } from '@/lib/utils/cn';

type DiscordButtonProps = {
	label: string;
	loading?: boolean;
	className?: string;
	onClick: () => void;
};

export function DiscordButton({ label, loading = false, className, onClick }: DiscordButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={loading}
			aria-busy={loading || undefined}
			className={cn(
				'inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-md bg-discord text-body-lg font-semibold text-discord-fg transition-colors duration-120 ease-out hover:bg-discord-hover disabled:cursor-wait disabled:opacity-70 sm:h-11',
				className
			)}
		>
			{loading ? (
				<LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
			) : (
				<DiscordLogo className="size-5" />
			)}
			{label}
		</button>
	);
}
