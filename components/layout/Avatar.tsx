import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { readableTextOn } from '@/lib/utils/contrast';

export type AvatarShape = 'square' | 'circle';
export type AvatarSize = 'sm' | 'md' | 'lg';

const sizes: Record<AvatarSize, string> = {
	sm: 'size-6 text-overline',
	md: 'size-8 text-body-sm',
	lg: 'size-10 text-body'
};

const pixels: Record<AvatarSize, number> = {
	sm: 24,
	md: 32,
	lg: 40
};

const shapes: Record<AvatarShape, string> = {
	square: 'rounded-md',
	circle: 'rounded-full'
};

type AvatarProps = {
	initials: string;
	color: string;
	src?: string | null;
	shape?: AvatarShape;
	size?: AvatarSize;
	className?: string;
};

export function Avatar({
	initials,
	color,
	src = null,
	shape = 'square',
	size = 'md',
	className
}: AvatarProps) {
	if (src !== null && src !== '') {
		return (
			<Image
				src={src}
				alt=""
				width={pixels[size]}
				height={pixels[size]}
				unoptimized
				className={cn('shrink-0 object-cover', sizes[size], shapes[shape], className)}
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			className={cn(
				'grid shrink-0 place-items-center font-bold tracking-normal',
				sizes[size],
				shapes[shape],
				readableTextOn(color),
				className
			)}
			style={{ backgroundColor: color }}
		>
			{initials}
		</span>
	);
}
