import { Grid2x2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type BrandMarkTone = 'solid' | 'subtle' | 'primary';
export type BrandMarkSize = 'xs' | 'sm' | 'md';

const tones: Record<BrandMarkTone, string> = {
	solid: 'bg-discord text-discord-fg',
	subtle: 'bg-primary-subtle text-primary',
	primary: 'bg-primary text-primary-fg'
};

const sizes: Record<BrandMarkSize, string> = {
	xs: 'size-7 rounded-md [&_svg]:size-4',
	sm: 'size-8 rounded-md [&_svg]:size-4.5',
	md: 'size-10 rounded-lg [&_svg]:size-5.5'
};

type BrandMarkProps = {
	tone?: BrandMarkTone;
	size?: BrandMarkSize;
	className?: string;
};

export function BrandMark({ tone = 'subtle', size = 'md', className }: BrandMarkProps) {
	return (
		<span className={cn('grid shrink-0 place-items-center', tones[tone], sizes[size], className)}>
			<Grid2x2 aria-hidden="true" />
		</span>
	);
}
