import type { MDXComponents } from 'mdx/types';
import { Callout } from './Callout';
import { DocsCommands } from './DocsCommands';
import { DocsFields } from './DocsFields';
import { docCellHead } from '@/lib/docs/styles';
import { Anchor, Fence, Heading } from './MdxElements';
import { Step, Steps } from './Steps';

export const MDX_COMPONENTS: MDXComponents = {
	h1: ({ children }) => <h2 className="scroll-mt-24 pt-4 text-h2 text-text">{children}</h2>,
	h2: ({ children }) => <Heading level={2}>{children}</Heading>,
	h3: ({ children }) => <Heading level={3}>{children}</Heading>,
	p: ({ children }) => <p className="text-body text-pretty text-text">{children}</p>,
	ul: ({ children }) => (
		<ul className="flex list-disc flex-col gap-2 pl-5 text-body text-text">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="flex list-decimal flex-col gap-2 pl-5 text-body text-text">{children}</ol>
	),
	li: ({ children }) => <li className="pl-1 marker:text-text-subtle">{children}</li>,
	a: ({ href, children }) => (
		<Anchor href={typeof href === 'string' ? href : ''}>{children}</Anchor>
	),
	strong: ({ children }) => <strong className="font-semibold text-text">{children}</strong>,
	code: ({ children }) => (
		<code className="rounded-sm border border-border bg-surface-sunken px-1 py-0.5 font-mono text-body-sm whitespace-nowrap text-text">
			{children}
		</code>
	),
	pre: ({ children }) => <Fence>{children}</Fence>,
	hr: () => <hr className="border-border" />,
	table: ({ children }) => (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full min-w-120 border-collapse">{children}</table>
		</div>
	),
	thead: ({ children }) => (
		<thead className="border-b border-border bg-surface-sunken">{children}</thead>
	),
	tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
	th: ({ children }) => (
		<th scope="col" className={docCellHead}>
			{children}
		</th>
	),
	td: ({ children }) => <td className="px-4 py-3 align-top text-body-sm text-text">{children}</td>,
	Callout,
	Steps,
	Step,
	Fields: DocsFields,
	Commands: DocsCommands
};
