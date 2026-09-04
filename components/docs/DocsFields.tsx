import { getTranslations } from 'next-intl/server';
import { fieldsOf, loadModuleCatalog, type CatalogField } from '@/lib/catalog';

const cellHead = 'px-4 py-2.5 text-left font-mono text-overline text-text-muted uppercase';
const cellBody = 'px-4 py-3 align-top text-body-sm text-text';

type Words = Awaited<ReturnType<typeof getTranslations>>;

function defaultOf(field: CatalogField, docs: Words, registry: Words): string {
	const value = field.default;

	if (value === undefined || value === null || value === '') return docs('noDefault');
	if (value === true) return docs('defaultOn');
	if (value === false) return docs('defaultOff');
	if (Array.isArray(value)) return value.length === 0 ? docs('noDefault') : value.join(', ');

	const option = field.options?.find((entry) => entry.value === value);

	if (option !== undefined) return registry(option.i18nLabel);

	return typeof value === 'number' || typeof value === 'string' ? String(value) : docs('noDefault');
}

export async function DocsFields({ module }: { module: string }) {
	const [docs, registry, catalog] = await Promise.all([
		getTranslations('docs'),
		getTranslations('registry'),
		loadModuleCatalog()
	]);

	if (catalog.length === 0)
		return <p className="text-body text-text">{docs('catalogUnavailable')}</p>;

	const fields = fieldsOf(catalog, module);

	if (fields.length === 0) return <p className="text-body text-text">{docs('noFields')}</p>;

	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full min-w-120 border-collapse">
				<thead className="border-b border-border bg-surface-sunken">
					<tr>
						<th scope="col" className={`${cellHead} w-1/4`}>
							{docs('table.option')}
						</th>
						<th scope="col" className={`${cellHead} w-1/6`}>
							{docs('table.type')}
						</th>
						<th scope="col" className={`${cellHead} w-1/12`}>
							{docs('table.default')}
						</th>
						<th scope="col" className={`${cellHead} w-1/2`}>
							{docs('table.whatItDoes')}
						</th>
					</tr>
				</thead>
				<tbody>
					{fields.map((field) => (
						<tr key={field.key} className="border-b border-border last:border-0">
							<td className={cellBody}>
								<span className="font-semibold text-text">{registry(field.i18nLabel)}</span>
								{field.required ? (
									<span className="mt-0.5 block text-caption font-normal text-text-muted">
										{docs('required')}
									</span>
								) : null}
							</td>
							<td className={cellBody}>{docs(`types.${field.type}`)}</td>
							<td className={cellBody}>{defaultOf(field, docs, registry)}</td>
							<td className={cellBody}>{registry(field.i18nDescription)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
