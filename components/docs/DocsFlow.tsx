import { ChevronRight } from 'lucide-react';

type FlowStep = {
	title: string;
	note?: string;
};

type DocsFlowProps = {
	steps: FlowStep[];
	caption?: string;
};

export function DocsFlow({ steps, caption }: DocsFlowProps) {
	return (
		<figure className="flex flex-col gap-2">
			<ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
				{steps.map((step, index) => (
					<li key={step.title} className="flex min-w-0 flex-1 items-stretch gap-2">
						<div className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-border bg-surface-sunken px-3 py-2.5">
							<span className="font-mono text-overline text-text-subtle uppercase">
								{index + 1}
							</span>
							<span className="text-body-sm font-medium text-text">{step.title}</span>
							{step.note === undefined ? null : (
								<span className="text-caption font-normal text-text-muted">{step.note}</span>
							)}
						</div>

						{index === steps.length - 1 ? null : (
							<ChevronRight
								aria-hidden="true"
								className="my-auto size-4 shrink-0 rotate-90 text-text-subtle sm:rotate-0"
							/>
						)}
					</li>
				))}
			</ol>

			{caption === undefined ? null : (
				<figcaption className="text-caption font-normal text-text-muted">{caption}</figcaption>
			)}
		</figure>
	);
}
