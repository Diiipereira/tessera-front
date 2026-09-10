import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { HELP_IDS, MODULE_HELP } from './module-help';

type Tree = { [key: string]: string | Tree };

const DICTIONARIES: Record<string, Tree> = { 'en-US': enUS, 'pt-BR': ptBR };

function at(tree: Tree, path: string): Tree | string | undefined {
	let node: Tree | string | undefined = tree;

	for (const step of path.split('.')) {
		if (typeof node !== 'object') return undefined;
		node = node[step];
	}

	return node;
}

const written = (value: Tree | string | undefined): boolean =>
	typeof value === 'string' && value.trim() !== '';

describe.each(Object.keys(DICTIONARIES))('the help popovers in %s', (locale) => {
	const dictionary = DICTIONARIES[locale] as Tree;

	it.each(HELP_IDS)('says something in every part of %s', (id) => {
		const { namespace } = MODULE_HELP[id];
		const help = at(dictionary, namespace);

		expect(help, namespace).toBeTypeOf('object');
		expect(written(at(dictionary, `${namespace}.label`)), `${namespace}.label`).toBe(true);
		expect(written(at(dictionary, `${namespace}.title`)), `${namespace}.title`).toBe(true);
		expect(written(at(dictionary, `${namespace}.body`)), `${namespace}.body`).toBe(true);
	});

	it.each(HELP_IDS)('shows exactly the points %s was written with', (id) => {
		const { namespace, points } = MODULE_HELP[id];
		const listed = at(dictionary, `${namespace}.points`);

		expect(listed, `${namespace}.points`).toBeTypeOf('object');
		expect(Object.keys(listed as Tree).sort()).toEqual([...points].sort());
	});

	it.each(HELP_IDS)('gives every point of %s a heading and a line', (id) => {
		const { namespace, points } = MODULE_HELP[id];

		for (const point of points) {
			const path = `${namespace}.points.${point}`;

			expect(written(at(dictionary, `${path}.title`)), `${path}.title`).toBe(true);
			expect(written(at(dictionary, `${path}.body`)), `${path}.body`).toBe(true);
		}
	});
});
