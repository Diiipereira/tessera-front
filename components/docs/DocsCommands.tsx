import { getTranslations } from 'next-intl/server';
import { commandsOf, loadCommandCatalog } from '@/lib/catalog';

const cellHead = 'px-4 py-2.5 text-left font-mono text-overline text-text-muted uppercase';
const cellBody = 'px-4 py-3 align-top text-body-sm text-text';

export async function DocsCommands({ module }: { module?: string }) {
	const [docs, registry, catalog] = await Promise.all([
		getTranslations('docs'),
		getTranslations('registry'),
		loadCommandCatalog()
	]);

	if (catalog.length === 0) {
		return <p className="text-body text-text">{docs('catalogUnavailable')}</p>;
	}

	const commands = module === undefined ? catalog : commandsOf(catalog, module);
	const withModule = module === undefined;

	if (commands.length === 0) {
		return <p className="text-body text-text">{docs('noCommandsForModule')}</p>;
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-border">
			<table className="w-full min-w-120 border-collapse">
				<thead className="border-b border-border bg-surface-sunken">
					<tr>
						<th scope="col" className={`${cellHead} w-1/4`}>
							{docs('table.command')}
						</th>
						{withModule ? (
							<th scope="col" className={`${cellHead} w-1/6`}>
								{docs('table.module')}
							</th>
						) : null}
						<th scope="col" className={cellHead}>
							{docs('table.whatItDoes')}
						</th>
					</tr>
				</thead>
				<tbody>
					{commands.map((command) => (
						<tr key={command.name} className="border-b border-border last:border-0">
							<td className={cellBody}>
								<code className="rounded-sm border border-border bg-surface-sunken px-1 py-0.5 font-mono text-body-sm whitespace-nowrap text-text">
									/{command.name}
								</code>
							</td>
							{withModule ? (
								<td className={cellBody}>
									{command.module === null
										? docs('noModule')
										: registry(`modules.${command.module}.label`)}
								</td>
							) : null}
							<td className={cellBody}>{registry(`commands.${command.name}.description`)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
