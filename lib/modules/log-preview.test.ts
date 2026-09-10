import { describe, expect, it } from 'vitest';
import { previewVariables, toEmbedDraft, toMessageDraft, type ApiEmbedDto } from './log-preview';

const MEMBER = '100000000000000001';
const CHANNEL = '100000000000000003';

const names: Record<string, string> = { [MEMBER]: 'Lia', [CHANNEL]: 'geral' };

const embed: ApiEmbedDto = {
	title: 'Mensagem apagada',
	description: `Uma mensagem de <@${MEMBER}> foi apagada em <#${CHANNEL}>.`,
	color: 0x5865f2,
	timestamp: '2026-09-10T12:00:00.000Z',
	author: { name: 'Lia', icon_url: 'https://cdn/lia.png' },
	footer: { text: `ID: ${MEMBER}` },
	fields: [{ name: 'Conteúdo', value: 'oi', inline: false }]
};

const label = (): string => 'há 1 ano';

describe('turning a log embed into something the preview can draw', () => {
	it('keeps the colour Discord was given, padded to six digits', () => {
		expect(toEmbedDraft(embed).color).toBe('#5865f2');
		expect(toEmbedDraft({ ...embed, color: 0x00ff00 }).color).toBe('#00ff00');
	});

	it('carries the author picture, which is what names who the entry is about', () => {
		expect(toEmbedDraft(embed).authorIconUrl).toBe('https://cdn/lia.png');
	});

	it('reads an embed with nothing in it without inventing anything', () => {
		const empty = toEmbedDraft({});

		expect(empty.title).toBe('');
		expect(empty.fields).toEqual([]);
		expect(empty.timestamp).toBe(false);
	});

	it('always previews as an embed, never as plain text', () => {
		expect(toMessageDraft(embed).mode).toBe('embed');
	});
});

describe('reading the mentions a log entry carries', () => {
	it('shows a name instead of a snowflake', () => {
		const found = previewVariables(embed, names, 'desconhecido', label);

		expect(found.find((one) => one.token === `<@${MEMBER}>`)?.sample).toBe('@Lia');
		expect(found.find((one) => one.token === `<#${CHANNEL}>`)?.sample).toBe('#geral');
	});

	it('says so plainly when the id has no name', () => {
		const found = previewVariables(
			{ description: '<@999999999999999999>' },
			names,
			'desconhecido',
			label
		);

		expect(found[0]?.sample).toBe('@desconhecido');
	});

	it('turns a Discord timestamp into words, because Discord does that too', () => {
		const found = previewVariables(
			{ description: 'Conta criada <t:1600000000:R>' },
			names,
			'?',
			label
		);

		expect(found[0]?.sample).toBe('há 1 ano');
	});

	it('looks inside the fields as well as the description', () => {
		const found = previewVariables(
			{ fields: [{ name: 'Cargos', value: `<@${MEMBER}>`, inline: false }] },
			names,
			'?',
			label
		);

		expect(found).toHaveLength(1);
	});

	it('lists a repeated mention once', () => {
		const found = previewVariables(
			{ description: `<@${MEMBER}> e <@${MEMBER}>` },
			names,
			'?',
			label
		);

		expect(found).toHaveLength(1);
	});
});
