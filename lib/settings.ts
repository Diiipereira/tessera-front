import type { GuildSettings, GuildSettingsDto } from '@/lib/types/management';

export const toEditableSettings = (dto: GuildSettingsDto): GuildSettings => ({
	locale: dto.locale,
	timezone: dto.timezone,
	embedColor: dto.embedColor,
	botNickname: dto.botNickname
});
