'use client';

import { useState } from 'react';
import { BRAND } from '@/lib/brand';
import { DISCORD, EMBED_SWATCHES } from '@/lib/discord-colors';
import { renderVariables } from '@/lib/message-variables';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';

type DiscordPreviewProps = {
	message: MessageDraft;
	variables: MessageVariable[];
	timestampLabel?: string;
};

function PreviewImage({ src, className }: { src: string; className: string }) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<p className="mt-2 text-[12px]" style={{ color: DISCORD.muted }}>
				Discord will not be able to show this image.
			</p>
		);
	}

	return (
		<img
			src={src}
			alt=""
			className={className}
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

export function DiscordPreview({
	message,
	variables,
	timestampLabel = 'Today at 14:32'
}: DiscordPreviewProps) {
	const resolve = (value: string) => renderVariables(value, variables);
	const embed = message.embed;

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
							Bot
						</span>
						<span className="text-[12px]" style={{ color: DISCORD.muted }}>
							{timestampLabel}
						</span>
					</div>

					{message.mode === 'text' ? (
						<div className="mt-0.5 wrap-break-word whitespace-pre-wrap">
							{message.text === '' ? (
								<span style={{ color: DISCORD.muted }}>Nothing to post yet.</span>
							) : (
								<Line text={resolve(message.text)} />
							)}
						</div>
					) : embedIsEmpty ? (
						<div className="mt-1 text-[14px]" style={{ color: DISCORD.muted }}>
							The embed is empty — add a title or a description.
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
												className="size-20 shrink-0 rounded-xs object-cover"
											/>
										)}
									</div>

									{embed.imageUrl === '' ? null : (
										<PreviewImage
											src={embed.imageUrl}
											className="mt-3 max-h-64 w-full rounded-xs object-cover"
										/>
									)}

									{embed.footerText === '' && !embed.timestamp ? null : (
										<p className="mt-2 text-[12px]" style={{ color: DISCORD.muted }}>
											{resolve(embed.footerText)}
											{embed.footerText !== '' && embed.timestamp ? ' • ' : ''}
											{embed.timestamp ? timestampLabel : ''}
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
