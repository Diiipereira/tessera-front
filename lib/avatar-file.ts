export const AVATAR_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/gif'] as const;

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const avatarTypesLabel = (): string =>
	AVATAR_MEDIA_TYPES.map((type) => type.replace('image/', '').toUpperCase()).join(', ');

export const avatarLimitLabel = (): string => `${String(MAX_AVATAR_BYTES / 1024 / 1024)} MB`;

export type AvatarRefusal = 'type' | 'size';

export const refusalFor = (file: { type: string; size: number }): AvatarRefusal | null => {
	if (!AVATAR_MEDIA_TYPES.some((allowed) => allowed === file.type)) return 'type';
	if (file.size > MAX_AVATAR_BYTES) return 'size';

	return null;
};

export const readAsDataUri = (file: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = () => {
			reject(new Error('The file could not be read'));
		};
		reader.onload = () => {
			resolve(typeof reader.result === 'string' ? reader.result : '');
		};

		reader.readAsDataURL(file);
	});
