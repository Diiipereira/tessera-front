import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { docsHref } from '@/lib/docs/types';

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

const codeClass =
	'rounded-sm border border-border bg-surface-sunken px-1 py-0.5 font-mono text-body-sm whitespace-nowrap text-text';
const linkClass = 'text-primary underline underline-offset-2 hover:text-primary-hover';

function piece(token: string, key: number): ReactNode {
	if (token.startsWith('`') && token.endsWith('`')) {
		return (
			<code key={key} className={codeClass}>
				{token.slice(1, -1)}
			</code>
		);
	}

	if (token.startsWith('**') && token.endsWith('**')) {
		return (
			<strong key={key} className="font-semibold text-text">
				{token.slice(2, -2)}
			</strong>
		);
	}

	const link = LINK.exec(token);
	if (!link) return <Fragment key={key}>{token}</Fragment>;

	const label = link[1] ?? '';
	const href = link[2] ?? '';

	if (href === '/docs') {
		return (
			<Link key={key} href="/docs" className={linkClass}>
				{label}
			</Link>
		);
	}

	if (href.startsWith('/docs/')) {
		return (
			<Link key={key} href={docsHref(href.slice('/docs/'.length))} className={linkClass}>
				{label}
			</Link>
		);
	}

	return (
		<a key={key} href={href} rel="external" className={linkClass}>
			{label}
		</a>
	);
}

export function Inline({ text }: { text: string }) {
	return <>{text.split(TOKEN).map((token, index) => piece(token, index))}</>;
}
