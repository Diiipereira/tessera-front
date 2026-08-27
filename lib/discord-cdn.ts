const CDN = 'https://cdn.discordapp.com';

function extensionFor(hash: string): 'gif' | 'png' {
	return hash.startsWith('a_') ? 'gif' : 'png';
}

export function guildIconUrl(guildId: string, hash: string | null, size = 128): string | null {
	if (hash === null || hash === '') return null;
	return `${CDN}/icons/${guildId}/${hash}.${extensionFor(hash)}?size=${String(size)}`;
}

export function userAvatarUrl(userId: string, hash: string | null, size = 64): string | null {
	if (hash === null || hash === '') return null;
	return `${CDN}/avatars/${userId}/${hash}.${extensionFor(hash)}?size=${String(size)}`;
}
