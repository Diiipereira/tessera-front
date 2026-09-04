import { describe, expect, it } from 'vitest';
import en from '@/messages/en-US.json';
import pt from '@/messages/pt-BR.json';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { LogEvent } from '@/lib/types/module-configs';
import {
	groupsInOrder,
	missingChannel,
	toLoggingConfig,
	toLoggingPatch,
	toRoutePayload,
	type LogDestinationDto
} from './logging';

const CHANNEL = '901234567890123008';
const ROLE = '901234567890123010';

const stateOf = (config: Record<string, unknown> = {}): GuildModuleStateDto => ({
	key: 'logging',
	enabled: true,
	version: 3,
	config
});

const destination = (patch: Partial<LogDestinationDto> = {}): LogDestinationDto => ({
	eventType: 'message_delete',
	group: 'Messages',
	channelId: CHANNEL,
	enabled: true,
	...patch
});

const event = (patch: Partial<LogEvent> = {}): LogEvent => ({
	id: 'message_delete',
	group: 'Messages',
	channelId: CHANNEL,
	enabled: true,
	...patch
});

describe('toLoggingConfig', () => {
	it('keeps every event the API sent, in the order it sent them', () => {
		const config = toLoggingConfig(stateOf(), [
			destination({ eventType: 'ban', group: 'Moderation' }),
			destination({ eventType: 'member_join', group: 'Members' })
		]);

		expect(config.events.map((one) => one.id)).toEqual(['ban', 'member_join']);
	});

	it('reads the ignore lists from the module config', () => {
		const config = toLoggingConfig(
			stateOf({ ignoredChannelIds: [CHANNEL], ignoredRoleIds: [ROLE] }),
			[]
		);

		expect(config.ignoredChannelIds).toEqual([CHANNEL]);
		expect(config.ignoredRoleIds).toEqual([ROLE]);
	});

	it('survives an ignore list the API never wrote', () => {
		const config = toLoggingConfig(stateOf(), []);

		expect(config.ignoredChannelIds).toEqual([]);
		expect(config.ignoredRoleIds).toEqual([]);
	});

	it('drops anything in an ignore list that is not an id', () => {
		const config = toLoggingConfig(stateOf({ ignoredRoleIds: [ROLE, 7, null] }), []);

		expect(config.ignoredRoleIds).toEqual([ROLE]);
	});
});

describe('what the screen sends back', () => {
	it('names each event the way the API named it', () => {
		expect(toRoutePayload([event({ id: 'ban' })])).toEqual([
			{ eventType: 'ban', channelId: CHANNEL, enabled: true }
		]);
	});

	it('sends only the ignore lists in the module patch, never the events', () => {
		const config = toLoggingConfig(stateOf({ ignoredRoleIds: [ROLE] }), [destination()]);

		expect(toLoggingPatch(config)).toEqual({ ignoredChannelIds: [], ignoredRoleIds: [ROLE] });
	});
});

describe('grouping', () => {
	it('takes the groups from the events, so a group the API adds still shows', () => {
		expect(
			groupsInOrder([
				event({ group: 'Messages' }),
				event({ group: 'Members' }),
				event({ group: 'Messages' })
			])
		).toEqual(['Messages', 'Members']);
	});

	it('keeps an event whose group this screen never heard of', () => {
		expect(groupsInOrder([event({ group: 'Threads' })])).toEqual(['Threads']);
	});
});

describe('the warning about a missing channel', () => {
	it('names an event that is on with nowhere to post', () => {
		expect(missingChannel([event({ channelId: null })])).toHaveLength(1);
	});

	it('says nothing about an event that is off with no channel', () => {
		expect(missingChannel([event({ channelId: null, enabled: false })])).toHaveLength(0);
	});
});

describe('the dictionaries', () => {
	const events = (messages: typeof en): Record<string, { name: string; body: string }> =>
		messages.modules.logging.event;

	it('names every event in both languages', () => {
		expect(Object.keys(events(en)).sort()).toEqual(Object.keys(events(pt)).sort());
	});

	it('names every group in both languages', () => {
		expect(Object.keys(en.modules.logging.groups).sort()).toEqual(
			Object.keys(pt.modules.logging.groups).sort()
		);
	});

	it('leaves no event without a name and a body', () => {
		for (const [id, text] of Object.entries(events(pt))) {
			expect(text.name, id).not.toBe('');
			expect(text.body, id).not.toBe('');
		}
	});
});
