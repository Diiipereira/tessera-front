import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ScheduledMessage } from '@/lib/types/module-configs';
import {
	MAX_SCHEDULED_MESSAGES,
	MAX_SCHEDULED_NAME_LENGTH,
	blankScheduledMessage,
	dateless,
	dayless,
	isSavedId,
	nameless,
	sendable,
	speechless,
	toSchedulePayload,
	toScheduledConfig,
	toScheduledMessage,
	unroutable,
	type ScheduledMessageDto,
	type ScheduledMessagesDto
} from './scheduled';

const MESSAGE_UUID = 'e6b3e0a2-1111-4222-8333-444444444444';
const CHANNEL = '901234567890123008';

const state = (enabled = true): GuildModuleStateDto => ({
	key: 'scheduled',
	enabled,
	config: {},
	version: 4
});

const dto = (patch: Partial<ScheduledMessageDto> = {}): ScheduledMessageDto => ({
	id: MESSAGE_UUID,
	name: 'Daily standup',
	channelId: CHANNEL,
	kind: 'recurring',
	runAt: null,
	days: ['mon', 'wed'],
	timeOfDay: '09:00',
	enabled: true,
	content: 'Good morning',
	embed: {},
	timezone: 'America/Sao_Paulo',
	lastRunAt: null,
	nextRunAt: '2026-09-07T12:00:00.000Z',
	...patch
});

const page = (messages: ScheduledMessageDto[] = [dto()]): ScheduledMessagesDto => ({
	messages,
	timezone: 'America/Sao_Paulo'
});

const message = (patch: Partial<ScheduledMessage> = {}): ScheduledMessage => ({
	...toScheduledMessage(dto()),
	...patch
});

describe('isSavedId', () => {
	it('knows a message the API already gave an id to', () => {
		expect(isSavedId(MESSAGE_UUID)).toBe(true);
	});

	it('knows one that only exists in this browser tab', () => {
		expect(isSavedId('sm_abc123')).toBe(false);
	});
});

describe('toScheduledConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toScheduledConfig(state(false), page()).enabled).toBe(false);
	});

	it('takes the clock from the server, not from a picker of its own', () => {
		expect(toScheduledConfig(state(), page()).timezone).toBe('America/Sao_Paulo');
	});

	it('keeps the id the API gave, so the next save edits instead of duplicating', () => {
		expect(toScheduledConfig(state(), page()).messages[0]?.id).toBe(MESSAGE_UUID);
	});

	it('reads a message with no embed as plain text', () => {
		expect(toScheduledConfig(state(), page()).messages[0]?.message.mode).toBe('text');
	});

	it('reads a message that has an embed as an embed', () => {
		expect(
			toScheduledConfig(state(), page([dto({ embed: { title: 'Standup' } })])).messages[0]?.message
				.mode
		).toBe('embed');
	});

	it('carries the days and the time the guild picked', () => {
		expect(toScheduledConfig(state(), page()).messages[0]).toMatchObject({
			days: ['mon', 'wed'],
			timeOfDay: '09:00'
		});
	});

	it('trims a one-off date down to what the date input takes', () => {
		const once = page([dto({ kind: 'once', runAt: '2026-09-05T12:00:00.000Z', days: [] })]);

		expect(toScheduledConfig(state(), once).messages[0]?.runAt).toBe('2026-09-05T12:00');
	});

	it('leaves a recurring message with no date in the input', () => {
		expect(toScheduledConfig(state(), page()).messages[0]?.runAt).toBe('');
	});

	it('keeps when the server says it runs next', () => {
		expect(toScheduledConfig(state(), page()).messages[0]?.nextRunAt).toBe(
			'2026-09-07T12:00:00.000Z'
		);
	});
});

describe('toSchedulePayload', () => {
	it('sends the message the screen holds', () => {
		expect(toSchedulePayload([message()])[0]).toMatchObject({
			id: MESSAGE_UUID,
			name: 'Daily standup',
			channelId: CHANNEL,
			kind: 'recurring',
			days: ['mon', 'wed'],
			timeOfDay: '09:00'
		});
	});

	it('sends no id for a message this browser just invented', () => {
		expect(toSchedulePayload([message({ id: 'sm_new' })])[0]?.id).toBeNull();
	});

	it('trims the name it sends', () => {
		expect(toSchedulePayload([message({ name: '  Daily  ' })])[0]?.name).toBe('Daily');
	});

	it('never sends a name longer than the API takes', () => {
		expect(
			toSchedulePayload([message({ name: 'a'.repeat(MAX_SCHEDULED_NAME_LENGTH + 20) })])[0]?.name
		).toHaveLength(MAX_SCHEDULED_NAME_LENGTH);
	});

	it('leaves out a message that never got a name, since the API would refuse it', () => {
		expect(toSchedulePayload([message(), message({ id: 'sm_2', name: '  ' })])).toHaveLength(1);
	});

	it('leaves out a message with nowhere to post it', () => {
		expect(toSchedulePayload([message({ channelId: null })])).toHaveLength(0);
	});

	it('leaves out a message with nothing to say', () => {
		const empty = message();

		expect(
			toSchedulePayload([{ ...empty, message: { ...empty.message, text: '   ' } }])
		).toHaveLength(0);
	});

	it('keeps a message that says nothing in words but carries an embed', () => {
		const embedded = message();

		expect(
			toSchedulePayload([
				{ ...embedded, message: { ...embedded.message, mode: 'embed', text: '' } }
			])
		).toHaveLength(1);
	});

	it('leaves out a repeat that lands on no day', () => {
		expect(toSchedulePayload([message({ days: [] })])).toHaveLength(0);
	});

	it('leaves out a single run with no date', () => {
		expect(toSchedulePayload([message({ kind: 'once', runAt: '' })])).toHaveLength(0);
	});

	it('sends a one-off date as a moment the API can read', () => {
		const once = message({ kind: 'once', runAt: '2026-09-05T12:00' });

		expect(toSchedulePayload([once])[0]?.runAt).toBe(new Date('2026-09-05T12:00').toISOString());
	});

	it('sends no date for a recurring message', () => {
		expect(toSchedulePayload([message()])[0]?.runAt).toBeNull();
	});

	it('sends no days for a single run', () => {
		const once = message({ kind: 'once', runAt: '2026-09-05T12:00', days: ['mon'] });

		expect(toSchedulePayload([once])[0]?.days).toEqual([]);
	});

	it('sends an empty embed for a message written as plain text', () => {
		expect(toSchedulePayload([message()])[0]?.embed).toEqual({});
	});

	it('sends the embed for a message written as an embed', () => {
		const embedded = message();

		expect(
			toSchedulePayload([
				{
					...embedded,
					message: {
						...embedded.message,
						mode: 'embed',
						embed: { ...embedded.message.embed, title: 'Standup' }
					}
				}
			])[0]?.embed
		).toMatchObject({ title: 'Standup' });
	});

	it('never sends more messages than the API would take', () => {
		const many = Array.from({ length: MAX_SCHEDULED_MESSAGES + 5 }, (_, index) =>
			message({ id: `sm_${String(index)}`, name: `Message ${String(index)}` })
		);

		expect(toSchedulePayload(many)).toHaveLength(MAX_SCHEDULED_MESSAGES);
	});

	it('keeps a message the guild switched off, since off is not deleted', () => {
		expect(toSchedulePayload([message({ enabled: false })])[0]?.enabled).toBe(false);
	});
});

describe('what the screen warns about', () => {
	it('counts the messages with no name', () => {
		expect(nameless([message(), message({ id: 'sm_2', name: '' })])).toBe(1);
	});

	it('counts the named messages with nowhere to post them', () => {
		expect(unroutable([message({ channelId: null }), message({ id: 'b', name: '' })])).toBe(1);
	});

	it('counts the named messages with nothing to say', () => {
		const empty = message();

		expect(speechless([{ ...empty, message: { ...empty.message, text: '' } }])).toBe(1);
	});

	it('counts the repeats that land on no day', () => {
		expect(dayless([message({ days: [] })])).toBe(1);
	});

	it('counts the single runs with no date', () => {
		expect(dateless([message({ kind: 'once', runAt: '' })])).toBe(1);
	});

	it('has nothing to warn about when every message is ready', () => {
		const ready = [message()];

		expect(
			nameless(ready) + unroutable(ready) + speechless(ready) + dayless(ready) + dateless(ready)
		).toBe(0);
	});
});

describe('sendable', () => {
	it('calls a finished message sendable', () => {
		expect(sendable(message())).toBe(true);
	});

	it('never calls a fresh blank message sendable', () => {
		expect(sendable(blankScheduledMessage('sm_new'))).toBe(false);
	});
});

describe('blankScheduledMessage', () => {
	it('starts on a weekday rather than on no day at all', () => {
		expect(blankScheduledMessage('sm_new').days).toEqual(['mon']);
	});

	it('has never run, because it has never been saved', () => {
		expect(blankScheduledMessage('sm_new')).toMatchObject({
			nextRunAt: null,
			lastRunAt: null
		});
	});
});
