import { createTranslator } from 'next-intl';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { DOC_GROUP_IDS } from '@/content/docs/nav';
import { MODULE_IDS } from '@/lib/types/modules';

type Tree = { [key: string]: string | Tree };

const DICTIONARIES: Record<string, Tree> = { 'en-US': enUS, 'pt-BR': ptBR };

const PLACEHOLDER = /\{\s*(\w+)\s*[},]/g;

const RICH_TAG = /<(\w+)>/g;

function flatten(tree: Tree, prefix = ''): Map<string, string> {
	const flat = new Map<string, string>();

	for (const [key, value] of Object.entries(tree)) {
		const path = prefix === '' ? key : `${prefix}.${key}`;

		if (typeof value === 'string') {
			flat.set(path, value);
			continue;
		}

		for (const [nested, text] of flatten(value, path)) flat.set(nested, text);
	}

	return flat;
}

const placeholdersOf = (text: string): string[] =>
	[...text.matchAll(PLACEHOLDER)].map((match) => match[1] ?? '').sort();

const richTagsOf = (text: string): string[] =>
	[...text.matchAll(RICH_TAG)].map((match) => match[1] ?? '').sort();

type Value = number | ((chunks: ReactNode) => ReactNode);

type Format = (key: string, values: Record<string, Value>) => string;

const valuesFor = (text: string): Record<string, Value> => {
	const values: Record<string, Value> = {};

	for (const name of placeholdersOf(text)) values[name] = 1;
	for (const tag of richTagsOf(text)) values[tag] = (chunks: ReactNode) => chunks;

	return values;
};

const formatterFor = (locale: string, tree: Tree, broken: string[]): Format =>
	createTranslator({
		locale,
		messages: tree,
		onError: (error) => broken.push(`${locale}: ${error.message}`)
	}) as unknown as Format;

const english = flatten(enUS);
const portuguese = flatten(ptBR);

describe('message dictionaries', () => {
	it('ships one file per supported locale', () => {
		expect(Object.keys(DICTIONARIES).sort()).toEqual([...SUPPORTED_LOCALES].sort());
	});

	it('translates every English key into Portuguese', () => {
		const missing = [...english.keys()].filter((key) => !portuguese.has(key));

		expect(missing).toEqual([]);
	});

	it('carries no Portuguese key that English does not have', () => {
		const extra = [...portuguese.keys()].filter((key) => !english.has(key));

		expect(extra).toEqual([]);
	});

	it('leaves no message empty', () => {
		const blank = [...english, ...portuguese]
			.filter(([, text]) => text.trim() === '')
			.map(([key]) => key);

		expect(blank).toEqual([]);
	});

	it('keeps the same placeholders on both sides, or the message breaks at runtime', () => {
		const mismatched = [...english]
			.filter(([key, text]) => {
				const translated = portuguese.get(key);

				return (
					translated !== undefined &&
					placeholdersOf(text).join() !== placeholdersOf(translated).join()
				);
			})
			.map(([key]) => key);

		expect(mismatched).toEqual([]);
	});

	it('names every documentation group, which the nav resolves by id', () => {
		const missing = DOC_GROUP_IDS.flatMap((id) =>
			[...Object.entries(DICTIONARIES)]
				.filter(([, tree]) => flatten(tree).get(`docs.groups.${id}`) === undefined)
				.map(([locale]) => `${locale}: docs.groups.${id}`)
		);

		expect(missing).toEqual([]);
	});

	it('names every module, which every screen resolves by id', () => {
		const missing = MODULE_IDS.flatMap((id) =>
			[...Object.entries(DICTIONARIES)]
				.filter(([, tree]) => flatten(tree).get(`nav.${id}`) === undefined)
				.map(([locale]) => `${locale}: nav.${id}`)
		);

		expect(missing).toEqual([]);
	});

	it('leaves no argument in the registry, which is rendered without values', () => {
		const interpolated = [...Object.entries(DICTIONARIES)].flatMap(([locale, tree]) =>
			[...flatten(tree)]
				.filter(([key, text]) => key.startsWith('registry.') && placeholdersOf(text).length > 0)
				.map(([key]) => `${locale}: ${key}`)
		);

		expect(interpolated).toEqual([]);
	});

	it('formats every registry message with no values, the way the docs render it', () => {
		const broken: string[] = [];

		for (const [locale, tree] of Object.entries(DICTIONARIES)) {
			const t = createTranslator({
				locale,
				messages: tree,
				namespace: 'registry',
				onError: (error) => broken.push(`${locale}: ${error.message}`)
			});

			for (const key of flatten(tree).keys()) {
				if (key.startsWith('registry.')) t(key.slice('registry.'.length));
			}
		}

		expect(broken).toEqual([]);
	});

	it('shows the product tokens with their braces, because the reader types them', () => {
		const t = createTranslator({ locale: 'pt-BR', messages: ptBR, namespace: 'registry' });

		expect(t('modules.welcome.fields.message.description')).toContain('{user}');
		expect(t('modules.levels.fields.announceMessage.description')).toContain('{user.mention}');
	});

	it('formats every message, so a malformed plural is caught here and not on screen', () => {
		const broken: string[] = [];

		for (const [locale, tree] of Object.entries(DICTIONARIES)) {
			const format = formatterFor(locale, tree, broken);

			for (const [key, text] of flatten(tree)) format(key, valuesFor(text));
		}

		expect(broken).toEqual([]);
	});

	it('keeps the same rich tags on both sides, which t.rich throws without', () => {
		const mismatched = [...english]
			.filter(([key, text]) => {
				const translated = portuguese.get(key);

				return (
					translated !== undefined && richTagsOf(text).join() !== richTagsOf(translated).join()
				);
			})
			.map(([key]) => key);

		expect(mismatched).toEqual([]);
	});
});

describe('a message that counts things', () => {
	const automod = { 'pt-BR': ptBR, 'en-US': enUS } as const;

	const pt = createTranslator({
		locale: 'pt-BR',
		messages: automod['pt-BR'],
		namespace: 'modules.automod'
	});

	const en = createTranslator({
		locale: 'en-US',
		messages: automod['en-US'],
		namespace: 'modules.automod'
	});

	it('counts one blocked word in the singular, which is what a new rule usually holds', () => {
		expect(pt('summary.words', { count: 1 })).toBe('1 palavra bloqueada');
		expect(en('summary.words', { count: 1 })).toBe('1 blocked word');
	});

	it('still counts many in the plural', () => {
		expect(pt('summary.words', { count: 4 })).toBe('4 palavras bloqueadas');
		expect(en('summary.words', { count: 4 })).toBe('4 blocked words');
	});

	it('counts one mention, one attachment and one message in the singular too', () => {
		expect(pt('summary.mentions', { threshold: 1 })).toBe('1 menção em uma mensagem');
		expect(pt('summary.attachments', { threshold: 1 })).toBe('1 anexo');
		expect(pt('summary.spam', { threshold: 1, window: 5 })).toBe('1 mensagem em 5s');
		expect(en('summary.mentions', { threshold: 1 })).toBe('1 mention in one message');
		expect(en('summary.attachments', { threshold: 1 })).toBe('1 attachment');
		expect(en('summary.spam', { threshold: 1, window: 5 })).toBe('1 message in 5s');
	});

	it('says what the playground found without a parenthesised s', () => {
		expect(pt('reason.links', { count: 1 })).toBe('encontrou 1 link');
		expect(pt('reason.links', { count: 2 })).toBe('encontrou 2 links');
		expect(en('reason.invites', { count: 1 })).toBe('found 1 invite link');
		expect(en('reason.invites', { count: 2 })).toBe('found 2 invite links');
	});
});
