import { LoaderCircle } from 'lucide-react';
import Link, { type LinkProps } from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant =
	'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-danger' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

const base =
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors duration-120 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
	primary:
		'border-0 bg-primary font-semibold text-primary-fg hover:bg-primary-hover active:bg-primary-active',
	secondary:
		'border border-border bg-surface-sunken font-medium text-text hover:bg-surface-hover active:bg-surface-sunken',
	outline:
		'border border-border-strong bg-transparent font-medium text-text hover:border-text-subtle hover:bg-surface-hover active:bg-surface-sunken',
	ghost:
		'border border-transparent bg-transparent font-medium text-text-muted hover:bg-surface-hover active:bg-surface-sunken',
	'ghost-danger':
		'border border-transparent bg-transparent font-medium text-text-muted hover:bg-danger-subtle hover:text-danger active:bg-danger-subtle',
	danger:
		'border-0 bg-danger font-semibold text-danger-on hover:bg-danger-hover active:bg-danger-active',
	link: 'h-auto border-0 bg-transparent px-1 font-medium text-link hover:underline'
};

const sizes: Record<ButtonSize, string> = {
	sm: 'h-8 px-3 text-body [&_svg]:size-3.5',
	md: 'h-9 px-4 text-body [&_svg]:size-4',
	lg: 'h-10 px-5 text-body [&_svg]:size-4',
	xl: 'h-12 px-6 text-body-lg font-semibold [&_svg]:size-5'
};

const iconSizes: Record<ButtonSize, string> = {
	sm: 'h-8 w-8 px-0 text-body [&_svg]:size-3.5',
	md: 'h-9 w-9 px-0 text-body [&_svg]:size-4',
	lg: 'h-10 w-10 px-0 text-body [&_svg]:size-4',
	xl: 'h-12 w-12 px-0 text-body-lg [&_svg]:size-5'
};

type SharedProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	iconOnly?: boolean;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
};

type ButtonProps = SharedProps &
	Omit<ComponentPropsWithoutRef<'button'>, keyof SharedProps> & { href?: undefined };

type AnchorProps<T extends string> = SharedProps &
	Omit<ComponentPropsWithoutRef<'a'>, keyof SharedProps | 'href'> & { href: LinkProps<T>['href'] };

export function Button<T extends string>(props: ButtonProps | AnchorProps<T>) {
	const {
		variant = 'primary',
		size = 'md',
		loading = false,
		iconOnly = false,
		disabled = false,
		className,
		children,
		...rest
	} = props;

	const classes = cn(base, variants[variant], iconOnly ? iconSizes[size] : sizes[size], className);

	const spinner = loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null;

	if (rest.href !== undefined) {
		const { href, ...anchorRest } = rest as Omit<AnchorProps<T>, keyof SharedProps>;
		return (
			<Link
				{...anchorRest}
				href={href}
				className={classes}
				aria-disabled={disabled || loading || undefined}
				aria-busy={loading || undefined}
			>
				{spinner}
				{children}
			</Link>
		);
	}

	const buttonRest = rest as Omit<ButtonProps, keyof SharedProps | 'href'>;
	return (
		<button
			{...buttonRest}
			className={classes}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
		>
			{spinner}
			{children}
		</button>
	);
}
