import Link from 'next/link';
import { isValidElement, type ReactNode } from 'react';
import { headingSlug } from '@/lib/docs/slug';
import { docLinkClass } from '@/lib/docs/styles';
import { docsHref } from '@/lib/docs/types';
import { cn } from '@/lib/utils/cn';
import { CodeBlock } from './CodeBlock';

function textOf(node: ReactNode): string {
	if (typeof node === 'string') return node;
	if (typeof node === 'number') return String(node);
	if (Array.isArray(node)) return node.map(textOf).join('');
	if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);

	return '';
}

export function Heading({ level, children }: { level: 2 | 3; children?: ReactNode }) {
	const Tag = level === 2 ? 'h2' : 'h3';

	return (
		<Tag
			id={headingSlug(textOf(children))}
			className={cn('scroll-mt-24 text-text', level === 2 ? 'pt-4 text-h2' : 'pt-2 text-h3')}
		>
			{children}
		</Tag>
	);
}

export function Fence({ children }: { children?: ReactNode }) {
	if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) return null;

	const language = /language-(\w+)/.exec(children.props.className ?? '')?.[1] ?? 'text';

	return (
		<CodeBlock code={textOf(children.props.children).replace(/\n$/, '')} language={language} />
	);
}

export function Anchor({ href, children }: { href?: string; children?: ReactNode }) {
	const target = href ?? '';

	if (target === '/docs' || target.startsWith('/docs/')) {
		return (
			<Link href={docsHref(target.replace(/^\/docs\/?/, ''))} className={docLinkClass}>
				{children}
			</Link>
		);
	}

	return (
		<a href={target} rel={target.startsWith('/') ? undefined : 'external'} className={docLinkClass}>
			{children}
		</a>
	);
}
