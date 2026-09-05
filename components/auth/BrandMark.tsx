import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export type BrandMarkSize = 'xs' | 'sm' | 'md' | 'lg';

const sizes: Record<BrandMarkSize, string> = {
	xs: 'size-7',
	sm: 'size-8',
	md: 'size-10',
	lg: 'size-12'
};

const pixels: Record<BrandMarkSize, number> = {
	xs: 28,
	sm: 32,
	md: 40,
	lg: 48
};

type BrandMarkProps = {
	size?: BrandMarkSize;
	className?: string;
};

export function BrandMark({ size = 'md', className }: BrandMarkProps) {
	return (
		<Image
			src="/images/Tessera_logo.png"
			alt=""
			width={pixels[size]}
			height={pixels[size]}
			priority
			className={cn('shrink-0 object-contain', sizes[size], className)}
		/>
	);
}
