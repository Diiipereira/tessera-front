import {
	BLURPLE,
	DISCORD,
	DISCORD_BUTTON,
	MENTION,
	type DiscordButtonStyle
} from '@/lib/discord-colors';

type EmbedFieldMock = {
	name: string;
	value: string;
	inline?: boolean;
};

type EmbedMock = {
	color?: string;
	author?: string;
	title?: string;
	description?: string;
	fields?: EmbedFieldMock[];
	footer?: string;
	image?: string;
};

type ButtonMock = {
	label: string;
	style?: DiscordButtonStyle;
};

type ReactionMock = {
	emoji: string;
	count?: number;
};

type DocsMessageProps = {
	author?: string;
	bot?: boolean;
	time?: string;
	content?: string;
	embed?: EmbedMock;
	buttons?: ButtonMock[];
	reactions?: ReactionMock[];
	caption?: string;
};

const SPLIT_ON_MENTION = /([@#][^\s.,!?]+)/g;

const IS_MENTION = /^[@#][^\s.,!?]+$/;

const BOT_TAG = 'BOT';

function Mentioned({ text }: { text: string }) {
	return (
		<>
			{text.split(SPLIT_ON_MENTION).map((piece, index) =>
				IS_MENTION.test(piece) ? (
					<span
						key={`${piece}-${String(index)}`}
						className="rounded-[3px] px-0.5"
						style={{ backgroundColor: MENTION.fill, color: MENTION.text }}
					>
						{piece}
					</span>
				) : (
					<span key={`${piece}-${String(index)}`}>{piece}</span>
				)
			)}
		</>
	);
}

function Lines({ text }: { text: string }) {
	return (
		<>
			{text.split('\n').map((line, index) => (
				<span key={`${line}-${String(index)}`} className="block">
					<Mentioned text={line} />
				</span>
			))}
		</>
	);
}

function Embed({ embed }: { embed: EmbedMock }) {
	const rows = embed.fields ?? [];

	return (
		<div
			className="mt-2 max-w-120 overflow-hidden rounded-xs border-l-4"
			style={{ backgroundColor: DISCORD.embed, borderLeftColor: embed.color ?? BLURPLE }}
		>
			<div className="flex flex-col gap-2 px-3 py-2.5">
				{embed.author === undefined ? null : (
					<p className="text-[13px] font-semibold" style={{ color: DISCORD.text }}>
						{embed.author}
					</p>
				)}

				{embed.title === undefined ? null : (
					<p className="text-[15px] font-semibold text-white">{embed.title}</p>
				)}

				{embed.description === undefined ? null : (
					<p className="text-[13px] whitespace-pre-line" style={{ color: DISCORD.text }}>
						<Lines text={embed.description} />
					</p>
				)}

				{rows.length === 0 ? null : (
					<div className="flex flex-wrap gap-x-6 gap-y-2">
						{rows.map((field) => (
							<div
								key={field.name}
								className={field.inline === true ? 'min-w-24 flex-1' : 'w-full'}
							>
								<p className="text-[13px] font-semibold text-white">{field.name}</p>
								<p className="text-[13px]" style={{ color: DISCORD.text }}>
									{field.value}
								</p>
							</div>
						))}
					</div>
				)}

				{embed.image === undefined ? null : (
					<div
						className="grid h-28 place-items-center rounded-xs text-[11px]"
						style={{ backgroundColor: DISCORD.surface, color: DISCORD.muted }}
					>
						{embed.image}
					</div>
				)}

				{embed.footer === undefined ? null : (
					<p className="text-[11px]" style={{ color: DISCORD.muted }}>
						{embed.footer}
					</p>
				)}
			</div>
		</div>
	);
}

export function DocsMessage({
	author = 'Tessera',
	bot = true,
	time,
	content,
	embed,
	buttons,
	reactions,
	caption
}: DocsMessageProps) {
	return (
		<figure className="flex flex-col gap-2">
			<div className="rounded-lg p-4" style={{ backgroundColor: DISCORD.surface }}>
				<div className="flex gap-3">
					<span
						aria-hidden="true"
						className="grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
						style={{ backgroundColor: BLURPLE }}
					>
						{author.slice(0, 2).toUpperCase()}
					</span>

					<div className="min-w-0 flex-1">
						<p className="flex flex-wrap items-center gap-2">
							<span className="text-[15px] font-semibold text-white">{author}</span>
							{bot ? (
								<span
									className="rounded-[3px] px-1 py-px text-[10px] font-semibold text-white"
									style={{ backgroundColor: BLURPLE }}
								>
									{BOT_TAG}
								</span>
							) : null}
							{time === undefined ? null : (
								<span className="text-[11px]" style={{ color: DISCORD.muted }}>
									{time}
								</span>
							)}
						</p>

						{content === undefined ? null : (
							<p className="text-[15px]" style={{ color: DISCORD.text }}>
								<Lines text={content} />
							</p>
						)}

						{embed === undefined ? null : <Embed embed={embed} />}

						{buttons === undefined || buttons.length === 0 ? null : (
							<div className="mt-2 flex flex-wrap gap-2">
								{buttons.map((button) => (
									<span
										key={button.label}
										className="inline-flex h-8 items-center rounded-[3px] px-3 text-[14px] font-medium text-white"
										style={{ backgroundColor: DISCORD_BUTTON[button.style ?? 'secondary'] }}
									>
										{button.label}
									</span>
								))}
							</div>
						)}

						{reactions === undefined || reactions.length === 0 ? null : (
							<div className="mt-2 flex flex-wrap gap-1.5">
								{reactions.map((reaction) => (
									<span
										key={reaction.emoji}
										className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[13px]"
										style={{ backgroundColor: DISCORD.reaction, color: DISCORD.text }}
									>
										<span aria-hidden="true">{reaction.emoji}</span>
										<span className="tabular-nums">{reaction.count ?? 1}</span>
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{caption === undefined ? null : (
				<figcaption className="text-caption font-normal text-text-muted">{caption}</figcaption>
			)}
		</figure>
	);
}
