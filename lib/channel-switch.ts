import type { Channel } from '@/lib/types/discord';

export type ChannelSwitch =
	| { kind: 'none' }
	| { kind: 'first'; to: string }
	| { kind: 'moved'; from: string; to: string }
	| { kind: 'cleared'; from: string };

export function channelSwitch(
	saved: string | null,
	draft: string | null,
	channels: readonly Channel[]
): ChannelSwitch {
	if (draft === saved) return { kind: 'none' };

	const nameOf = (id: string): string => channels.find((channel) => channel.id === id)?.name ?? id;

	if (draft === null)
		return saved === null ? { kind: 'none' } : { kind: 'cleared', from: nameOf(saved) };

	if (saved === null) return { kind: 'first', to: nameOf(draft) };

	return { kind: 'moved', from: nameOf(saved), to: nameOf(draft) };
}
