import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { SUPPORTED_LOCALES } from '@/lib/locale';

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
