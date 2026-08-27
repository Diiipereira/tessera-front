import { Alert } from '@/components/ui/Alert';
import { cooldownLabel } from '@/lib/commands';
import { commandsForModule } from '@/lib/docs/pages/commands';
import type { DocBlock } from '@/lib/docs/types';
import { cn } from '@/lib/utils/cn';
import { CodeBlock } from './CodeBlock';
import { Inline } from './Inline';

const cellHead = 'px-4 py-2.5 text-left font-mono text-overline text-text-muted uppercase';
const cellBody = 'px-4 py-3 align-top text-body-sm text-text';

const OPTION_WIDTHS = ['w-1/4', 'w-1/6', 'w-1/12', 'w-1/2'];

function DocTable({ head, rows, widths }: { head: string[]; rows: string[][]; widths?: string[] }) {
	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full min-w-120 border-collapse">
				<thead className="border-b border-border bg-surface-sunken">
					<tr>
						{head.map((label, column) => (
							<th key={label} scope="col" className={cn(cellHead, widths?.[column])}>
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => (
						<tr key={index} className="border-b border-border last:border-0">
							{row.map((cell, column) => (
								<td key={column} className={cellBody}>
									<Inline text={cell} />
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Block({ block }: { block: DocBlock }) {
	switch (block.kind) {
		case 'heading':
			return (
				<h2 id={block.id} className="scroll-mt-24 pt-4 text-h2 text-text">
					{block.text}
				</h2>
			);

		case 'paragraph':
			return (
				<p className="text-body text-pretty text-text">
					<Inline text={block.text} />
				</p>
			);

		case 'list': {
			const List = block.ordered === true ? 'ol' : 'ul';
			return (
				<List
					className={cn(
						'flex flex-col gap-2 pl-5 text-body text-text',
						block.ordered === true ? 'list-decimal' : 'list-disc'
					)}
				>
					{block.items.map((item, index) => (
						<li key={index} className="pl-1 marker:text-text-subtle">
							<Inline text={item} />
						</li>
					))}
				</List>
			);
		}

		case 'steps':
			return (
				<ol className="flex flex-col gap-4">
					{block.items.map((step, index) => (
						<li key={index} className="flex gap-3">
							<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-mono text-caption text-primary">
								{index + 1}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block text-body font-semibold text-text">{step.title}</span>
								<span className="mt-0.5 block text-body text-pretty text-text">
									<Inline text={step.text} />
								</span>
							</span>
						</li>
					))}
				</ol>
			);

		case 'code':
			return (
				<CodeBlock
					code={block.code}
					language={block.language}
					{...(block.filename === undefined ? {} : { filename: block.filename })}
				/>
			);

		case 'callout':
			return (
				<Alert variant={block.tone} title={block.title}>
					<Inline text={block.text} />
				</Alert>
			);

		case 'options':
			return (
				<DocTable
					head={['Option', 'Type', 'Default', 'What it does']}
					widths={OPTION_WIDTHS}
					rows={block.rows.map((row) => [`**${row.name}**`, row.type, row.fallback, row.text])}
				/>
			);

		case 'commands': {
			const commands = commandsForModule(block.module);
			if (commands.length === 0) {
				return (
					<p className="text-body text-text">
						This module has no slash commands of its own — it runs on its own once configured.
					</p>
				);
			}

			return (
				<DocTable
					head={['Command', 'What it does', 'Cooldown']}
					rows={commands.map((command) => [
						`\`/${command.name}\``,
						command.description,
						cooldownLabel(command.cooldownSeconds)
					])}
				/>
			);
		}

		case 'table':
			return <DocTable head={block.head} rows={block.rows} />;
	}
}

export function DocBody({ blocks }: { blocks: DocBlock[] }) {
	return (
		<div className="flex flex-col gap-4">
			{blocks.map((block, index) => (
				<Block key={index} block={block} />
			))}
		</div>
	);
}
