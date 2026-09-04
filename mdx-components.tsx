import type { MDXComponents } from 'mdx/types';
import { MDX_COMPONENTS } from '@/components/docs/mdx-map';

export function useMDXComponents(): MDXComponents {
	return MDX_COMPONENTS;
}
