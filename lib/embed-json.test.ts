import { describe, expect, it } from 'vitest';
import { colorHexOf, colorNumberOf, readEmbedJson, toDiscordEmbed } from './embed-json';
import { emptyEmbedDraft } from './modules/welcome';
import type { EmbedDraft } from './types/modules';

const BLUE = '#5865f2';

const NOW = new Date('2026-09-10T12:00:00.000Z');

const draft = (patch: Partial<EmbedDraft> = {}): EmbedDraft => ({
	...emptyEmbedDraft(BLUE),
	...patch
});

describe('colorNumberOf', () => {
	it('turns the hex the colour picker writes into the number Discord wants', () => {
		expect(colorNumberOf('#5865f2')).toBe(0x5865f2);
		expect(colorNumberOf('5865F2')).toBe(0x5865f2);
	});

	it('refuses anything that is not a colour', () => {
		expect(colorNumberOf('blurple')).toBeNull();
		expect(colorNumberOf('#58')).toBeNull();
	});
});

describe('colorHexOf', () => {
	it('turns the number Discord speaks back into hex, padded', () => {
		expect(colorHexOf(0x5865f2)).toBe('#5865f2');
		expect(colorHexOf(255)).toBe('#0000ff');
	});

	it('refuses what is not a colour number', () => {
		expect(colorHexOf('#5865f2')).toBeNull();
		expect(colorHexOf(-1)).toBeNull();
	});
});

describe('toDiscordEmbed', () => {
	it('writes the shape the Discord API reads', () => {
		const json = toDiscordEmbed(
			draft({
				title: 'Rules',
				description: 'Read them',
				authorName: 'Tessera',
				footerText: 'see you',
				imageUrl: 'https://cdn/a.png',
				thumbnailUrl: 'https://cdn/b.png'
			}),
			NOW
		);

		expect(json).toMatchObject({
			title: 'Rules',
			description: 'Read them',
			color: 0x5865f2,
			author: { name: 'Tessera' },
			footer: { text: 'see you' },
			image: { url: 'https://cdn/a.png' },
			thumbnail: { url: 'https://cdn/b.png' }
		});
	});

	it('leaves out what was never filled in', () => {
		expect(Object.keys(toDiscordEmbed(draft({ title: 'Rules' }), NOW))).toEqual(['title', 'color']);
	});

	it('drops a field that is missing a name or a value, as Discord would', () => {
		const json = toDiscordEmbed(
			draft({
				fields: [
					{ id: 'a', name: 'One', value: 'Read', inline: true },
					{ id: 'b', name: '', value: 'Orphan', inline: false }
				]
			}),
			NOW
		);

		expect(json.fields).toEqual([{ name: 'One', value: 'Read', inline: true }]);
	});

	it('stamps the moment when the draft asks for a timestamp', () => {
		expect(toDiscordEmbed(draft({ title: 'Rules', timestamp: true }), NOW).timestamp).toBe(
			NOW.toISOString()
		);
	});

	it('never carries the ids the editor uses to track rows', () => {
		const json = toDiscordEmbed(
			draft({ fields: [{ id: 'row-1', name: 'One', value: 'Read', inline: false }] }),
			NOW
		);

		expect(JSON.stringify(json)).not.toContain('row-1');
	});
});

describe('readEmbedJson', () => {
	it('reads back what this screen exported', () => {
		const original = draft({ title: 'Rules', description: 'Read them', footerText: 'see you' });
		const read = readEmbedJson(JSON.stringify(toDiscordEmbed(original, NOW)), BLUE);

		expect(read.status).toBe('ok');
		expect(read.status === 'ok' ? read.draft.title : null).toBe('Rules');
		expect(read.status === 'ok' ? read.draft.footerText : null).toBe('see you');
	});

	it('reads an embed written the way Discord writes it', () => {
		const read = readEmbedJson(
			JSON.stringify({
				title: 'Rules',
				color: 16711680,
				author: { name: 'Tessera', icon_url: 'https://cdn/a.png' },
				image: { url: 'https://cdn/b.png' },
				fields: [{ name: 'One', value: 'Read', inline: true }]
			}),
			BLUE
		);

		expect(read.status === 'ok' ? read.draft.color : null).toBe('#ff0000');
		expect(read.status === 'ok' ? read.draft.authorIconUrl : null).toBe('https://cdn/a.png');
		expect(read.status === 'ok' ? read.draft.imageUrl : null).toBe('https://cdn/b.png');
		expect(read.status === 'ok' ? read.draft.fields[0]?.name : null).toBe('One');
	});

	it('gives every pasted field a row id, so the editor can move them', () => {
		const read = readEmbedJson(
			JSON.stringify({ title: 'Rules', fields: [{ name: 'One', value: 'Read', inline: false }] }),
			BLUE
		);

		expect(read.status === 'ok' ? read.draft.fields[0]?.id : '').not.toBe('');
	});

	it('reads the embed out of a whole message payload', () => {
		const read = readEmbedJson(
			JSON.stringify({ content: 'hello', embeds: [{ title: 'Rules' }] }),
			BLUE
		);

		expect(read.status === 'ok' ? read.draft.title : null).toBe('Rules');
	});

	it('reads back what our own screens store, ids and all', () => {
		const read = readEmbedJson(
			JSON.stringify(draft({ title: 'Rules', authorName: 'Tessera' })),
			BLUE
		);

		expect(read.status === 'ok' ? read.draft.authorName : null).toBe('Tessera');
	});

	it('says it could not read text that is not JSON', () => {
		expect(readEmbedJson('{ title: Rules }', BLUE).status).toBe('unreadable');
		expect(readEmbedJson('   ', BLUE).status).toBe('unreadable');
	});

	it('says JSON that is not an embed is not an embed', () => {
		expect(readEmbedJson('{}', BLUE).status).toBe('notAnEmbed');
		expect(readEmbedJson(JSON.stringify({ footer: { text: 'alone' } }), BLUE).status).toBe(
			'notAnEmbed'
		);
	});

	it('falls back to the colour of the server when the paste has none', () => {
		const read = readEmbedJson(JSON.stringify({ title: 'Rules' }), '#00ff00');

		expect(read.status === 'ok' ? read.draft.color : null).toBe('#00ff00');
	});
});
