import { getTranslations } from 'next-intl/server';
import { Alert } from '@/components/ui/Alert';
import { START_COMMAND } from './access';

export async function Unreachable({ reason }: { reason: string }) {
	const t = await getTranslations('admin');

	return (
		<div className="mx-auto w-full max-w-4xl p-6 sm:p-10">
			<Alert variant="danger" title={t('unreachableTitle')}>
				{t.rich('unreachableBody', {
					reason,
					command: START_COMMAND,
					code: (chunks) => <code className="font-mono">{chunks}</code>
				})}
			</Alert>
		</div>
	);
}
