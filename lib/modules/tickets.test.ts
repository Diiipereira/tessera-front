import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ticketQuery } from '@/lib/tickets-client';
import type { TicketPanel } from '@/lib/types/module-configs';
import {
	DEFAULT_NAMING_PATTERN,
	MAX_AUTO_CLOSE_HOURS,
	MAX_OPEN_PER_USER,
	MAX_PANELS,
	MAX_STAFF_ROLES,
	colourFor,
	isSavedId,
	nameOf,
	nameless,
	toOpenTickets,
	toPanelPayload,
	toTicketsConfig,
	toTicketsPatch,
	type TicketDto,
	type TicketPanelDto
} from './tickets';

const PANEL_UUID = 'e6b3e0a2-1111-4222-8333-444444444444';
const CHANNEL = '901234567890123008';
const CATEGORY = '901234567890123009';
const STAFF_ROLE = '901234567890123001';
const ALICE = '111111111111111111';
const BOB = '222222222222222222';

const state = (config: Record<string, unknown> = {}, enabled = true): GuildModuleStateDto => ({
	key: 'tickets',
	configured: true,
	enabled,
	config,
	version: 4
});

const dto = (patch: Partial<TicketPanelDto> = {}): TicketPanelDto => ({
	id: PANEL_UUID,
	name: 'Support',
	channelId: CHANNEL,
	messageId: null,
	categoryId: CATEGORY,
	staffRoleIds: [STAFF_ROLE],
	namingPattern: 'ticket-{number}',
	maxOpenPerUser: 1,
	buttonLabel: 'Open a ticket',
	buttonEmoji: null,
	message: 'Tell us what you need.',
	embed: {},
	enabled: true,
	...patch
});

const panel = (patch: Partial<TicketPanel> = {}): TicketPanel => ({
	...(toTicketsConfig(state(), [dto()]).panels[0] as TicketPanel),
	...patch
});

const ticket = (patch: Partial<TicketDto> = {}): TicketDto => ({
	id: 'e6b3e0a2-0000-4000-8000-000000000002',
	number: 7,
	channelId: '901234567890123010',
	panelId: PANEL_UUID,
	status: 'open',
	subject: null,
	opener: { id: ALICE, username: 'alice', globalName: 'Alice', avatarHash: null },
	claimer: null,
	participants: [],
	rating: null,
	openedAt: '2026-09-04T10:00:00.000Z',
	lastActivityAt: '2026-09-04T10:00:00.000Z',
	closedAt: null,
	closeReason: null,
	...patch
});

describe('isSavedId', () => {
	it('knows a panel the API already gave an id to', () => {
		expect(isSavedId(PANEL_UUID)).toBe(true);
	});

	it('knows a panel that only exists in this browser tab', () => {
		expect(isSavedId('panel_abc123')).toBe(false);
	});
});

describe('toTicketsConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toTicketsConfig(state({}, false), []).enabled).toBe(false);
	});

	it('reads a guild that configured nothing as a working default', () => {
		expect(toTicketsConfig(state(), [])).toMatchObject({
			transcriptChannelId: null,
			autoCloseHours: 0,
			askForRating: false,
			closeDelaySeconds: 10
		});
	});

	it('keeps the transcript channel the guild picked', () => {
		expect(toTicketsConfig(state({ transcriptChannelId: CHANNEL }), []).transcriptChannelId).toBe(
			CHANNEL
		);
	});

	it('reads something that is not a snowflake as no channel at all', () => {
		expect(
			toTicketsConfig(state({ transcriptChannelId: 'general' }), []).transcriptChannelId
		).toBeNull();
	});

	it('clamps a window the API would refuse anyway', () => {
		expect(toTicketsConfig(state({ autoCloseHours: 9999 }), []).autoCloseHours).toBe(
			MAX_AUTO_CLOSE_HOURS
		);
	});

	it('keeps the id the API gave, so the next save edits instead of duplicating', () => {
		expect(toTicketsConfig(state(), [dto()]).panels[0]?.id).toBe(PANEL_UUID);
	});

	it('reads a panel with no embed as a plain text message', () => {
		expect(toTicketsConfig(state(), [dto()]).panels[0]?.message.mode).toBe('text');
	});

	it('reads a panel that has an embed as an embed', () => {
		expect(
			toTicketsConfig(state(), [dto({ embed: { title: 'Support' } })]).panels[0]?.message.mode
		).toBe('embed');
	});

	it('carries the words the guild wrote into the composer', () => {
		expect(toTicketsConfig(state(), [dto()]).panels[0]?.message.text).toBe(
			'Tell us what you need.'
		);
	});
});

describe('toTicketsPatch', () => {
	it('sends every guild setting the screen holds', () => {
		expect(toTicketsPatch(toTicketsConfig(state({ autoCloseHours: 48 }), []))).toEqual({
			transcriptChannelId: null,
			autoCloseHours: 48,
			askForRating: false,
			closeDelaySeconds: 10
		});
	});

	it('never sends the panels, which have a route of their own', () => {
		expect(toTicketsPatch(toTicketsConfig(state(), [dto()]))).not.toHaveProperty('panels');
	});
});

describe('toPanelPayload', () => {
	it('sends the panel the screen holds', () => {
		expect(toPanelPayload([panel()])[0]).toMatchObject({
			id: PANEL_UUID,
			name: 'Support',
			channelId: CHANNEL,
			categoryId: CATEGORY,
			staffRoleIds: [STAFF_ROLE]
		});
	});

	it('sends no id for a panel this browser just invented', () => {
		expect(toPanelPayload([panel({ id: 'panel_new' })])[0]?.id).toBeNull();
	});

	it('leaves out a panel that never got a name, since the API would refuse it', () => {
		expect(toPanelPayload([panel(), panel({ id: 'panel_2', name: '  ' })])).toHaveLength(1);
	});

	it('falls back to the default pattern rather than sending an empty one', () => {
		expect(toPanelPayload([panel({ namingPattern: '   ' })])[0]?.namingPattern).toBe(
			DEFAULT_NAMING_PATTERN
		);
	});

	it('never sends a limit of zero, which the API would refuse', () => {
		expect(toPanelPayload([panel({ maxOpenPerUser: 0 })])[0]?.maxOpenPerUser).toBe(1);
	});

	it('never sends a limit above what the API takes', () => {
		expect(toPanelPayload([panel({ maxOpenPerUser: 999 })])[0]?.maxOpenPerUser).toBe(
			MAX_OPEN_PER_USER
		);
	});

	it('never sends more staff roles than the API takes', () => {
		const roles = Array.from(
			{ length: MAX_STAFF_ROLES + 3 },
			(_, index) => `9012345678901230${String(index).padStart(2, '0')}`
		);

		expect(toPanelPayload([panel({ staffRoleIds: roles })])[0]?.staffRoleIds).toHaveLength(
			MAX_STAFF_ROLES
		);
	});

	it('sends an empty embed for a panel written as plain text', () => {
		expect(toPanelPayload([panel()])[0]?.embed).toEqual({});
	});

	it('sends the embed for a panel written as an embed', () => {
		const written = panel({
			message: {
				...panel().message,
				mode: 'embed',
				embed: { ...panel().message.embed, title: 'Hi' }
			}
		});

		expect(toPanelPayload([written])[0]?.embed).toMatchObject({ title: 'Hi' });
	});

	it('trims the name it sends', () => {
		expect(toPanelPayload([panel({ name: '  Support  ' })])[0]?.name).toBe('Support');
	});

	it('never sends more panels than the API would take', () => {
		const many = Array.from({ length: MAX_PANELS + 5 }, (_, index) =>
			panel({ id: `panel_${String(index)}`, name: `Panel ${String(index)}` })
		);

		expect(toPanelPayload(many)).toHaveLength(MAX_PANELS);
	});

	it('keeps a panel the guild switched off, since off is not deleted', () => {
		expect(toPanelPayload([panel({ enabled: false })])[0]?.enabled).toBe(false);
	});
});

describe('what the screen warns about', () => {
	it('counts the panels that would be dropped on save', () => {
		expect(nameless([panel(), panel({ id: 'panel_2', name: '' })])).toBe(1);
	});

	it('has nothing to warn about when every panel has a name', () => {
		expect(nameless([panel()])).toBe(0);
	});
});

describe('ticketQuery', () => {
	it('asks for the two situations a live ticket can be in', () => {
		expect(ticketQuery(['open', 'claimed'], 25)).toBe('limit=25&status=open&status=claimed');
	});

	it('asks for no situation at all when the filter is off', () => {
		expect(ticketQuery([], 25)).toBe('limit=25');
	});

	it('carries the cursor when there is another page', () => {
		expect(ticketQuery(['open'], 10, 12)).toContain('cursor=12');
	});

	it('leaves the cursor out on the first page', () => {
		expect(ticketQuery(['open'], 10)).not.toContain('cursor');
	});
});

describe('toOpenTickets', () => {
	it('prefers the name the member goes by', () => {
		expect(toOpenTickets({ tickets: [ticket()], nextCursor: null, open: 1 })[0]?.openerName).toBe(
			'Alice'
		);
	});

	it('falls back to the username, then to the id', () => {
		const rows = toOpenTickets({
			tickets: [
				ticket({ opener: { id: ALICE, username: 'alice', globalName: null, avatarHash: null } }),
				ticket({
					id: 'other',
					number: 8,
					opener: { id: BOB, username: null, globalName: null, avatarHash: null }
				})
			],
			nextCursor: null,
			open: 2
		});

		expect(rows.map((row) => row.openerName)).toEqual(['alice', BOB]);
	});

	it('says nobody took it rather than inventing a claimer', () => {
		expect(
			toOpenTickets({ tickets: [ticket()], nextCursor: null, open: 1 })[0]?.claimedBy
		).toBeNull();
	});

	it('names whoever took it', () => {
		expect(
			toOpenTickets({
				tickets: [
					ticket({
						claimer: { id: BOB, username: 'ferro', globalName: null, avatarHash: null }
					})
				],
				nextCursor: null,
				open: 1
			})[0]?.claimedBy
		).toBe('ferro');
	});

	it('gives an empty subject rather than the word null', () => {
		expect(toOpenTickets({ tickets: [ticket()], nextCursor: null, open: 1 })[0]?.subject).toBe('');
	});

	it('hands the moment over untouched, so the screen can say it in the reader language', () => {
		expect(toOpenTickets({ tickets: [ticket()], nextCursor: null, open: 1 })[0]?.openedAt).toBe(
			'2026-09-04T10:00:00.000Z'
		);
	});

	it('gives the same member the same colour every time', () => {
		expect(colourFor(ALICE)).toBe(colourFor(ALICE));
	});
});

describe('nameOf', () => {
	it('shows the id when Discord had no name to give', () => {
		expect(nameOf({ id: BOB, username: null, globalName: null, avatarHash: null })).toBe(BOB);
	});
});
