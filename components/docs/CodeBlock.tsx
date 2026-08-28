'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function CodeBlock({
	code,
	language,
	filename
}: {
	code: string;
	language: string;
	filename?: string;
}) {
	const t = useTranslations('docs');
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => {
				setCopied(false);
			}, 1600);
		} catch {
			setCopied(false);
		}
	}

	const Icon = copied ? Check : Copy;

	return (
		<figure className="overflow-hidden rounded-lg border border-border bg-surface-sunken">
			<figcaption className="flex h-9 items-center gap-3 border-b border-border px-3">
				<span className="min-w-0 flex-1 truncate font-mono text-caption text-text-muted">
					{filename ?? language}
				</span>
				<button
					type="button"
					onClick={() => {
						void copy();
					}}
					aria-label={copied ? t('copied') : t('copyCode')}
					className={cn(
						'flex size-6 shrink-0 items-center justify-center rounded-sm transition-colors duration-120 ease-out',
						copied ? 'text-success' : 'text-text-subtle hover:bg-surface-hover hover:text-text'
					)}
				>
					<Icon className="size-3.5" aria-hidden="true" />
				</button>
			</figcaption>

			<div className="overflow-x-auto">
				<pre className="w-fit min-w-full px-4 py-3">
					<code className="font-mono text-body-sm whitespace-pre text-text">{code}</code>
				</pre>
			</div>
		</figure>
	);
}
