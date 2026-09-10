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
	toLogTemplate,
	toRoutePayload,
	toTemplateDraft,
	type LogDestinationDto
} from './logging';
import { FALLBACK_EMBED_COLOR, emptyEmbedDraft } from './welcome';

const CHANNEL = '901234567890123008';
const ROLE = '901234567890123010';

const stateOf = (config: Record<string, unknown> = {}): GuildModuleStateDto => ({
	key: 'logging',
	configured: true,
	enabled: true,
	version: 3,
	config
});

const destination = (patch: Partial<LogDestinationDto> = {}): LogDestinationDto => ({
	eventType: 'message_delete',
	group: 'Messages',
	channelId: CHANNEL,
	enabled: true,
	template: null,
	...patch
});

const event = (patch: Partial<LogEvent> = {}): LogEvent => ({
	id: 'message_delete',
	group: 'Messages',
	channelId: CHANNEL,
	enabled: true,
	template: null,
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
			{ eventType: 'ban', channelId: CHANNEL, enabled: true, template: null }
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

describe('a template the owner wrote', () => {
	it('sends nothing when the form is empty, so the default keeps its place', () => {
		expect(toLogTemplate(emptyEmbedDraft())).toBeNull();
	});

	it('sends a template as soon as there is something to say', () => {
		expect(toLogTemplate({ ...emptyEmbedDraft(), title: 'Olha' })).toEqual({
			title: 'Olha',
			color: FALLBACK_EMBED_COLOR
		});
	});

	it('drops the row ids the form uses, which the API refuses', () => {
		const written = toLogTemplate({
			...emptyEmbedDraft(),
			title: 'Olha',
			fields: [{ id: 'row-1', name: 'Motivo', value: '{reason}', inline: true }]
		});

		expect(written?.['fields']).toEqual([{ name: 'Motivo', value: '{reason}', inline: true }]);
	});

	it('drops a half-written field instead of sending an empty one', () => {
		const written = toLogTemplate({
			...emptyEmbedDraft(),
			title: 'Olha',
			fields: [{ id: 'row-1', name: 'Motivo', value: '', inline: false }]
		});

		expect(written?.['fields']).toBeUndefined();
	});

	it('reads back what it wrote, so opening the dialog twice shows the same thing', () => {
		const draft = {
			...emptyEmbedDraft(),
			title: 'Olha',
			description: '{line}',
			fields: [{ id: 'row-1', name: 'Motivo', value: '{reason}', inline: true }]
		};

		const again = toTemplateDraft(toLogTemplate(draft));

		expect(again.title).toBe('Olha');
		expect(again.description).toBe('{line}');
		expect(again.fields.map((one) => one.name)).toEqual(['Motivo']);
	});

	it('reads a template that was never written as an empty form', () => {
		expect(toTemplateDraft(null).title).toBe('');
		expect(toTemplateDraft(null).fields).toEqual([]);
	});
});
