import { useTranslations } from 'next-intl';
import { BRAND } from '@/lib/brand';
import { MODULE_HIGHLIGHTS } from '@/lib/marketing';
import { Section, SectionIntro } from './Section';

export function ModuleGrid() {
	const t = useTranslations('marketing.modules');

	return (
		<Section id="features">
			<SectionIntro
				overline={t('overline')}
				title={t('title')}
				lead={t('lead', { brand: BRAND.name })}
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
							<h3 className="text-h4">{t(`${module.id}.title`)}</h3>
							<p className="mt-1.5 text-body text-pretty text-text-muted">
								{t(`${module.id}.body`)}
							</p>
						</div>
					);
				})}
			</div>
		</Section>
	);
}
