import { BRAND } from '@/lib/brand';
import { MODULE_HIGHLIGHTS } from '@/lib/marketing';
import { Section, SectionIntro } from './Section';

export function ModuleGrid() {
	return (
		<Section id="features">
			<SectionIntro
				overline="Modules"
				title="Turn on what you need, ignore the rest"
				lead={`Each module is off until you enable it, and each one has its own page with a live preview of whatever ${BRAND.name} will post.`}
				className="mb-12"
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{MODULE_HIGHLIGHTS.map((module) => {
					const Icon = module.icon;
					return (
						<div
							key={module.id}
							className="rounded-2xl border border-border bg-surface p-6 shadow-1 transition-colors duration-120 ease-out hover:border-border-strong"
						>
							<span className="mb-4 grid size-10 place-items-center rounded-lg bg-primary-subtle text-primary">
								<Icon className="size-5" aria-hidden="true" />
							</span>
							<h3 className="text-h4">{module.title}</h3>
							<p className="mt-1.5 text-body text-pretty text-text-muted">{module.body}</p>
						</div>
					);
				})}
			</div>
		</Section>
	);
}
