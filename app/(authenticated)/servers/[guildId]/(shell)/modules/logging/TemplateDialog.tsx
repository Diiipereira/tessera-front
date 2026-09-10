'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { FieldHelp } from '@/components/modules/FieldHelp';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useApiFailure } from '@/lib/hooks/useApiFailure';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { previewTemplate } from '@/lib/logging-client';
import { MODULE_HELP } from '@/lib/module-help';
import { toLogTemplate, toTemplateDraft, type LogTemplate } from '@/lib/modules/logging';
import { previewVariables, toMessageDraft, type ApiEmbedDto } from '@/lib/modules/log-preview';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';

const QUIET = 400;

type TemplateDialogProps = {
	guildId: string;
	eventType: string;
	eventName: string;
	template: LogTemplate | null;
	names: Record<string, string>;
	offered: Record<string, string>;
	now: string;
	onCancel: () => void;
	onSave: (template: LogTemplate | null) => void;
};

const chipsOf = (
	offered: Record<string, string>,
	sample: (text: string) => string
): MessageVariable[] =>
	Object.entries(offered).map(([token, value]) => ({
		token: `{${token}}`,
		key: `log${token.charAt(0).toUpperCase()}${token.slice(1)}`,
		sample: sample(value)
	}));

export function TemplateDialog({
	guildId,
	eventType,
	eventName,
	template,
	names,
	offered,
	now,
	onCancel,
	onSave
}: TemplateDialogProps) {
	const t = useTranslations('modules.logging');
	const shared = useTranslations('common');
	const describe = useApiFailure();
	const relative = useRelativeTime();

	const [draft, setDraft] = useState<MessageDraft>({
		mode: 'embed',
		text: '',
		embed: toTemplateDraft(template)
	});
	const [shown, setShown] = useState<ApiEmbedDto | null>(null);
	const [problem, setProblem] = useState<string | null>(null);

	const written = toLogTemplate(draft.embed);
	const at = new Date(now);

	const readable = (text: string): string => {
		const found = previewVariables({ description: text }, names, t('preview.unknown'), (moment) =>
			relative(moment.toISOString(), at)
		);

		return found.reduce((filled, one) => filled.split(one.token).join(one.sample), text);
	};

	useEffect(() => {
		const controller = new AbortController();

		const timer = setTimeout(() => {
			void previewTemplate(guildId, eventType, toLogTemplate(draft.embed), controller.signal).then(
				(result) => {
					if (controller.signal.aborted) return;

					if (result.status === 'error') {
						setProblem(describe(result.failure));
						return;
					}

					setProblem(null);
					setShown(result.preview.embed);
				}
			);
		}, QUIET);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [guildId, eventType, draft.embed, describe]);

	const variables = chipsOf(offered, readable);

	return (
		<Dialog
			open
			onOpenChange={(next) => {
				if (!next) onCancel();
			}}
			title={t('template.title', { name: eventName })}
			description={t('template.description')}
			size="lg"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						{shared('cancel')}
					</Button>
					<Button
						variant="outline"
						onClick={() => {
							onSave(null);
						}}
					>
						{t('template.reset')}
					</Button>
					<Button
						onClick={() => {
							onSave(written);
						}}
					>
						{t('template.apply')}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<div className="flex items-center gap-1">
					<span className="text-body-sm font-medium">{t('template.preview')}</span>
					<FieldHelp {...MODULE_HELP.loggingTemplate} />
				</div>

				{problem === null ? (
					shown === null ? null : (
						<DiscordPreview
							message={toMessageDraft(shown)}
							variables={previewVariables(shown, names, t('preview.unknown'), (moment) =>
								relative(moment.toISOString(), at)
							)}
							timestampLabel={relative(shown.timestamp ?? null, at)}
						/>
					)
				) : (
					<p className="rounded-md border border-danger bg-surface-sunken px-3 py-2 text-body-sm text-danger">
						{problem}
					</p>
				)}

				<MessageComposer
					value={draft}
					onChange={setDraft}
					variables={variables}
					modes={['embed']}
				/>
			</div>
		</Dialog>
	);
}
