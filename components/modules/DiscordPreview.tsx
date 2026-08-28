'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { DISCORD, EMBED_SWATCHES } from '@/lib/discord-colors';
import { renderVariables } from '@/lib/message-variables';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

type DiscordPreviewProps = {
	message: MessageDraft;
	variables: MessageVariable[];
	timestampLabel?: string;
};

function PreviewImage({ src, frame, fit }: { src: string; frame: string; fit: string }) {
	const [failed, setFailed] = useState(false);
	const t = useTranslations('modules.preview');

	if (failed) {
		return (
			<span
				className={cn(
					frame,
					'grid place-items-center overflow-hidden px-2 text-center text-[11px]'
				)}
				style={{ backgroundColor: DISCORD.surface, color: DISCORD.muted }}
			>
				{t('imageUnavailable')}
			</span>
		);
	}

	return (
		<img
			src={src}
			alt=""
			className={cn(frame, fit)}
			onError={() => {
				setFailed(true);
			}}
		/>
	);
}

function Line({ text }: { text: string }) {
	return (
		<>
			{text.split('\n').map((line, index) => (
				<span key={index} className="block min-h-lh">
					{line}
				</span>
			))}
		</>
	);
}

export function DiscordPreview({ message, variables, timestampLabel }: DiscordPreviewProps) {
	const t = useTranslations('modules.preview');
	const resolve = (value: string) => renderVariables(value, variables);
	const embed = message.embed;
	const stamp = timestampLabel ?? t('timestampSample');

	const embedIsEmpty =
		embed.title === '' &&
		embed.description === '' &&
		embed.fields.length === 0 &&
		embed.footerText === '' &&
		embed.authorName === '' &&
		embed.imageUrl === '';

	return (
		<div
			className="overflow-hidden rounded-lg p-4 text-[15px] leading-snug"
			style={{ backgroundColor: DISCORD.surface, color: DISCORD.text }}
		>
			<div className="flex gap-3">
				<span
					aria-hidden="true"
					className="grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white"
					style={{ backgroundColor: EMBED_SWATCHES[0] }}
				>
					{BRAND.name.slice(0, 2).toUpperCase()}
				</span>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-medium text-white">{BRAND.botName}</span>
						<span
							className="rounded-[3px] px-1 text-[10px] font-semibold text-white uppercase"
							style={{ backgroundColor: EMBED_SWATCHES[0] }}
						>
							{t('bot')}
						</span>
						<span className="text-[12px]" style={{ color: DISCORD.muted }}>
							{stamp}
						</span>
					</div>

					{message.mode === 'text' ? (
						<div className="mt-0.5 wrap-break-word whitespace-pre-wrap">
							{message.text === '' ? (
								<span style={{ color: DISCORD.muted }}>{t('nothing')}</span>
							) : (
								<Line text={resolve(message.text)} />
							)}
						</div>
					) : embedIsEmpty ? (
						<div className="mt-1 text-[14px]" style={{ color: DISCORD.muted }}>
							{t('embedEmpty')}
						</div>
					) : (
						<div
							className="mt-1 max-w-108 overflow-hidden rounded-xs"
							style={{ backgroundColor: DISCORD.embed }}
						>
							<div className="flex">
								<span
									aria-hidden="true"
									className="w-1 shrink-0"
									style={{ backgroundColor: embed.color }}
								/>
								<div className="min-w-0 flex-1 px-4 py-3">
									<div className="flex gap-4">
										<div className="min-w-0 flex-1">
											{embed.authorName === '' ? null : (
												<p className="mb-1 text-[14px] font-semibold text-white">
													{resolve(embed.authorName)}
												</p>
											)}

											{embed.title === '' ? null : (
												<p className="text-[16px] font-semibold text-white">
													{resolve(embed.title)}
												</p>
											)}

											{embed.description === '' ? null : (
												<div className="mt-2 text-[14px] wrap-break-word whitespace-pre-wrap">
													<Line text={resolve(embed.description)} />
												</div>
											)}

											{embed.fields.length > 0 ? (
												<div className="mt-2 flex flex-wrap gap-4">
													{embed.fields.map((field) => (
														<div
															key={field.id}
															className={field.inline ? 'min-w-37.5 flex-1' : 'w-full'}
														>
															<p className="text-[14px] font-semibold text-white">
																{resolve(field.name)}
															</p>
															<p className="text-[14px] wrap-break-word whitespace-pre-wrap">
																{resolve(field.value)}
															</p>
														</div>
													))}
												</div>
											) : null}
										</div>

										{embed.thumbnailUrl === '' ? null : (
											<PreviewImage
												src={embed.thumbnailUrl}
												frame="size-20 shrink-0 rounded-xs"
												fit="object-cover"
											/>
										)}
									</div>

									{embed.imageUrl === '' ? null : (
										<PreviewImage
											src={embed.imageUrl}
											frame="mt-3 h-40 w-full rounded-xs"
											fit="object-cover"
										/>
									)}

									{embed.footerText === '' && !embed.timestamp ? null : (
										<p className="mt-2 text-[12px]" style={{ color: DISCORD.muted }}>
											{resolve(embed.footerText)}
											{embed.footerText !== '' && embed.timestamp ? ' • ' : ''}
											{embed.timestamp ? stamp : ''}
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
