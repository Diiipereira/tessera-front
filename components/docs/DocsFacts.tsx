type Fact = {
	label: string;
	value: string;
};

type DocsFactsProps = {
	items: Fact[];
};

export function DocsFacts({ items }: DocsFactsProps) {
	return (
		<dl className="grid gap-x-6 gap-y-3 rounded-lg border border-border bg-surface-sunken px-4 py-3.5 sm:grid-cols-[max-content_minmax(0,1fr)]">
			{items.map((fact) => (
				<div key={fact.label} className="contents">
					<dt className="font-mono text-overline text-text-muted uppercase sm:pt-0.5">
						{fact.label}
					</dt>
					<dd className="text-body-sm text-pretty text-text">{fact.value}</dd>
				</div>
			))}
		</dl>
	);
}
