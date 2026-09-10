import { Check, X } from 'lucide-react';

type DocsCompareProps = {
	yesTitle: string;
	noTitle: string;
	yes: string[];
	no: string[];
};

export function DocsCompare({ yesTitle, noTitle, yes, no }: DocsCompareProps) {
	const columns = [
		{ title: yesTitle, items: yes, good: true },
		{ title: noTitle, items: no, good: false }
	];

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{columns.map((column) => (
				<section
					key={column.title}
					className="flex flex-col gap-2 rounded-lg border border-border bg-surface-sunken px-4 py-3.5"
				>
					<h4 className="text-body-sm font-semibold text-text">{column.title}</h4>
					<ul className="flex list-none flex-col gap-2 pl-0">
						{column.items.map((item) => (
							<li key={item} className="flex gap-2 pl-0 text-body-sm text-pretty text-text">
								{column.good ? (
									<Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
								) : (
									<X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
								)}
								<span className="min-w-0 flex-1">{item}</span>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
