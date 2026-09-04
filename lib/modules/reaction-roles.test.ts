import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ReactionPanel } from '@/lib/types/module-configs';
import {
	isSavedId,
	MAX_OPTIONS,
	roleless,
	toPanelPayload,
	toReactionRolesConfig,
	unfinished,
	type ReactionPanelDto
} from './reaction-roles';

const SAVED_ID = 'e6b3e0a2-1111-4222-8333-444444444444';
const RED = '901234567890123001';
const BLUE = '901234567890123002';

const state = (enabled: boolean): GuildModuleStateDto => ({
	key: 'reaction-roles',
	configured: true,
	enabled,
	config: {},
	version: 2
});

const dto = (patch: Partial<ReactionPanelDto> = {}): ReactionPanelDto => ({
	id: SAVED_ID,
	name: 'Colours',
	channelId: '901234567890123008',
	messageId: '901234567890123500',
	mode: 'toggle',
	useButtons: true,
	enabled: true,
	options: [{ id: 'option-1', roleId: RED, emoji: '🔴', label: 'Red', description: '' }],
	...patch
});

const panel = (patch: Partial<ReactionPanel> = {}): ReactionPanel => ({
	id: SAVED_ID,
	name: 'Colours',
	channelId: '901234567890123008',
	mode: 'toggle',
	useButtons: true,
	options: [{ id: 'option-1', emoji: '🔴', roleId: RED, label: 'Red', description: '' }],
	...patch
});

describe('isSavedId', () => {
	it('knows a panel the API already gave an id to', () => {
		expect(isSavedId(SAVED_ID)).toBe(true);
	});

	it('knows a panel that only exists in this browser tab', () => {
		expect(isSavedId('rp_abc123')).toBe(false);
	});
});

describe('toReactionRolesConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toReactionRolesConfig(state(false), [dto()]).enabled).toBe(false);
	});

	it('keeps the id the API gave, so the next save edits instead of duplicating', () => {
		expect(toReactionRolesConfig(state(true), [dto()]).panels[0]?.id).toBe(SAVED_ID);
	});

	it('turns a missing emoji into the empty box the screen shows', () => {
		const config = toReactionRolesConfig(state(true), [
			dto({ options: [{ id: 'o1', roleId: RED, emoji: null, label: 'Red', description: '' }] })
		]);

		expect(config.panels[0]?.options[0]?.emoji).toBe('');
	});
});

describe('toPanelPayload', () => {
	it('sends the id of a panel the API knows', () => {
		expect(toPanelPayload([panel()])[0]?.id).toBe(SAVED_ID);
	});

	it('sends no id for a panel this browser just invented', () => {
		expect(toPanelPayload([panel({ id: 'rp_new' })])[0]?.id).toBeNull();
	});

	it('leaves out an option that never got a role, since it would do nothing', () => {
		const payload = toPanelPayload([
			panel({
				options: [
					{ id: 'o1', emoji: '🔴', roleId: RED, label: 'Red', description: '' },
					{ id: 'o2', emoji: '🔵', roleId: null, label: 'Blue', description: '' }
				]
			})
		]);

		expect(payload[0]?.options).toHaveLength(1);
		expect(payload[0]?.options[0]?.roleId).toBe(RED);
	});

	it('turns an empty emoji box into no emoji at all', () => {
		const payload = toPanelPayload([
			panel({ options: [{ id: 'o1', emoji: '  ', roleId: RED, label: 'Red', description: '' }] })
		]);

		expect(payload[0]?.options[0]?.emoji).toBeNull();
	});

	it('trims the name it sends', () => {
		expect(toPanelPayload([panel({ name: '  Colours  ' })])[0]?.name).toBe('Colours');
	});

	it('never sends more options than the API would take', () => {
		const many = Array.from({ length: MAX_OPTIONS + 5 }, (_, index) => ({
			id: `o${String(index)}`,
			emoji: '',
			roleId: `90123456789012${String(3000 + index)}`,
			label: `Role ${String(index)}`,
			description: ''
		}));

		expect(toPanelPayload([panel({ options: many })])[0]?.options).toHaveLength(MAX_OPTIONS);
	});

	it('never sends the local option id, which the API would refuse', () => {
		expect(toPanelPayload([panel()])[0]?.options[0]).not.toHaveProperty('id');
	});
});

describe('what the screen warns about', () => {
	it('counts the options of a panel that still have no role', () => {
		expect(
			roleless(
				panel({
					options: [
						{ id: 'o1', emoji: '', roleId: null, label: '', description: '' },
						{ id: 'o2', emoji: '', roleId: BLUE, label: 'Blue', description: '' }
					]
				})
			)
		).toBe(1);
	});

	it('counts a panel with no name as half written', () => {
		expect(unfinished([panel({ name: '  ' })])).toBe(1);
	});

	it('counts a panel whose option has no role as half written', () => {
		expect(
			unfinished([
				panel({ options: [{ id: 'o1', emoji: '', roleId: null, label: '', description: '' }] })
			])
		).toBe(1);
	});

	it('has nothing to warn about when every panel is finished', () => {
		expect(unfinished([panel()])).toBe(0);
	});
});
