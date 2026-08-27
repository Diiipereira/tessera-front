import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const FONT_SIZES = [
	'display',
	'display-sm',
	'h1',
	'h2',
	'h3',
	'h4',
	'body-lg',
	'body',
	'body-sm',
	'caption',
	'overline'
];

const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			'font-size': [{ text: FONT_SIZES }]
		}
	}
});

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
