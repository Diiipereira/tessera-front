import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { GuildSettings } from '@/lib/types/management';
import {
	needsWelcomeChannel,
	startingDraft,
	startingModules,
	toSetupModules,
	toSetupWrites,
	type SetupDraft,
	type SetupModule
} from './setup';

const CHANNEL = '901234567890123001';
const LOG_CHANNEL = '901234567890123002';
const ROLE = '801234567890123001';

const state = (
	key: string,
	enabled = false,
	version = 1,
	config: Record<string, unknown> = {}
): GuildModuleStateDto => ({
	key,
	enabled,
	configured: true,
	config,
	version
});

const unit = (
	id: SetupModule['id'],
	enabled = false,
	version = 1,
	config: Record<string, unknown> = {}
): SetupModule => ({
	id,
	enabled,
	version,
	config
});

const SETTINGS: GuildSettings = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: ''
};

const draft = (patch: Partial<SetupDraft> = {}): SetupDraft => ({
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	wanted: [],
	logChannelId: null,
	welcomeChannelId: null,
	protectedRoleIds: [],
	...patch
});

describe('toSetupModules', () => {
	it('carries the version, so the wizard writes without a conflict', () => {
		expect(toSetupModules([state('welcome', true, 6)])).toEqual([
			{ id: 'welcome', enabled: true, version: 6, config: {} }
		]);
	});

	it('drops a module this dashboard has no screen for', () => {
		expect(toSetupModules([state('welcome'), state('ghost')])).toHaveLength(1);
	});
});

describe('startingModules', () => {
	it('starts from what the guild already turned on', () => {
		expect(startingModules([unit('welcome', true), unit('levels'), unit('tickets', true)])).toEqual(
			['welcome', 'tickets']
		);
	});

	it('suggests the three that most servers want when nothing is on yet', () => {
		expect(
			startingModules([unit('welcome'), unit('moderation'), unit('logging'), unit('levels')])
		).toEqual(['welcome', 'moderation', 'logging']);
	});

	it('never suggests a module the API did not declare', () => {
		expect(startingModules([unit('welcome'), unit('levels')])).toEqual(['welcome']);
	});
});

describe('startingDraft', () => {
	it('opens on the language and the clock the guild already has', () => {
		expect(startingDraft(SETTINGS, [])).toMatchObject({
			locale: 'pt-BR',
			timezone: 'America/Sao_Paulo'
		});
	});

	it('shows the channels and roles already configured, instead of empty pickers', () => {
		const draft = startingDraft(SETTINGS, [
			unit('welcome', true, 1, { channelId: CHANNEL }),
			unit('moderation', true, 1, {
				logChannelId: LOG_CHANNEL,
				protectedRoleIds: [ROLE]
			})
		]);

		expect(draft).toMatchObject({
			welcomeChannelId: CHANNEL,
			logChannelId: LOG_CHANNEL,
			protectedRoleIds: [ROLE]
		});
	});

	it('reads an unconfigured channel as nothing chosen, not as an empty string', () => {
		expect(startingDraft(SETTINGS, [unit('welcome', false, 1, { channelId: null })])).toMatchObject(
			{
				welcomeChannelId: null
			}
		);
	});

	it('survives a config written by another version of the schema', () => {
		const draft = startingDraft(SETTINGS, [
			unit('moderation', true, 1, { logChannelId: 12, protectedRoleIds: ['a', 7, null] })
		]);

		expect(draft).toMatchObject({ logChannelId: null, protectedRoleIds: ['a'] });
	});
});

describe('toSetupWrites', () => {
	it('writes only the modules whose state the wizard changed', () => {
		const writes = toSetupWrites(
			[unit('levels', true), unit('tickets'), unit('giveaways')],
			draft({ wanted: ['tickets'] })
		);

		expect(writes.map((write) => [write.id, write.enabled])).toEqual([
			['levels', false],
			['tickets', true]
		]);
	});

	it('sends the version each module arrived with', () => {
		const writes = toSetupWrites([unit('levels', false, 9)], draft({ wanted: ['levels'] }));

		expect(writes[0]?.version).toBe(9);
	});

	it('carries the welcome channel into the welcome write', () => {
		const writes = toSetupWrites(
			[unit('welcome')],
			draft({ wanted: ['welcome'], welcomeChannelId: CHANNEL })
		);

		expect(writes[0]).toMatchObject({
			id: 'welcome',
			enabled: true,
			config: { channelId: CHANNEL }
		});
	});

	it('never sends a null welcome channel, which the API would refuse', () => {
		const writes = toSetupWrites([unit('welcome')], draft({ wanted: ['welcome'] }));

		expect(writes[0]?.config).toEqual({});
	});

	it('keeps the protected roles the guild already had when the wizard runs again', () => {
		const modules = [unit('moderation', true, 1, { protectedRoleIds: [ROLE] })];
		const writes = toSetupWrites(modules, startingDraft(SETTINGS, modules));

		expect(writes[0]?.config).toEqual({ protectedRoleIds: [ROLE] });
	});

	it('carries the log channel and the protected roles into the moderation write', () => {
		const writes = toSetupWrites(
			[unit('moderation')],
			draft({ wanted: ['moderation'], logChannelId: LOG_CHANNEL, protectedRoleIds: [ROLE] })
		);

		expect(writes[0]?.config).toEqual({
			logChannelId: LOG_CHANNEL,
			protectedRoleIds: [ROLE]
		});
	});

	it('writes moderation even when its switch did not move, because it carries config', () => {
		const writes = toSetupWrites(
			[unit('moderation', true)],
			draft({ wanted: ['moderation'], logChannelId: LOG_CHANNEL })
		);

		expect(writes).toHaveLength(1);
	});

	it('clears the protected roles when the wizard emptied the picker', () => {
		const writes = toSetupWrites([unit('moderation', true)], draft({ wanted: ['moderation'] }));

		expect(writes[0]?.config).toEqual({ protectedRoleIds: [] });
	});

	it('turns off a module the wizard unchecked', () => {
		const writes = toSetupWrites([unit('economy', true)], draft());

		expect(writes[0]).toMatchObject({ id: 'economy', enabled: false });
	});

	it('writes nothing when the wizard changed nothing', () => {
		expect(toSetupWrites([unit('levels', true)], draft({ wanted: ['levels'] }))).toEqual([]);
	});
});

describe('needsWelcomeChannel', () => {
	it('says yes when welcome is picked with nowhere to greet', () => {
		expect(needsWelcomeChannel(draft({ wanted: ['welcome'] }))).toBe(true);
	});

	it('says no once a channel is chosen', () => {
		expect(needsWelcomeChannel(draft({ wanted: ['welcome'], welcomeChannelId: CHANNEL }))).toBe(
			false
		);
	});

	it('says no when welcome is not part of the setup', () => {
		expect(needsWelcomeChannel(draft({ wanted: ['levels'] }))).toBe(false);
	});
});
