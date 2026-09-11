import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeSkeleton } from './RouteSkeleton';

const SHELL = resolve(import.meta.dirname, '../../app/(authenticated)/servers/[guildId]/(shell)');

const LOADING = 'loading.tsx';

const PAGE = 'page.tsx';

const WITHOUT_A_SKELETON = ['billing'];

function routesWith(file: string): string[] {
	return readdirSync(SHELL, { recursive: true })
		.map((entry) => String(entry).replaceAll('\\', '/'))
		.filter((entry) => entry === file || entry.endsWith(`/${file}`))
		.map((entry) => entry.slice(0, -file.length).replace(/\/$/, ''));
}

const hrefFor = (route: string): string => (route === '' ? '/servers/1' : `/servers/1/${route}`);

const holdsOthers = (route: string, routes: string[]): boolean =>
	routes.some((other) => other !== route && (route === '' || other.startsWith(`${route}/`)));

describe('routeSkeleton', () => {
	it('finds every route that declares a loading boundary', () => {
		const missing = routesWith(LOADING).filter((route) => routeSkeleton(hrefFor(route)) === null);

		expect(missing).toEqual([]);
	});

	it('has a skeleton for every screen in the shell, because in dev the shell is what paints it', () => {
		const missing = routesWith(PAGE)
			.filter((route) => !WITHOUT_A_SKELETON.includes(route))
			.filter((route) => routeSkeleton(hrefFor(route)) === null);

		expect(missing).toEqual([]);
	});

	it('gives every screen with nothing below it a loading boundary, which is what production shows', () => {
		const pages = routesWith(PAGE);
		const boundaries = new Set(routesWith(LOADING));
		const missing = pages
			.filter((route) => !holdsOthers(route, pages))
			.filter((route) => !WITHOUT_A_SKELETON.includes(route))
			.filter((route) => !boundaries.has(route));

		expect(missing).toEqual([]);
	});

	it('keeps the list of screens without a skeleton to the ones that really have none', () => {
		expect(WITHOUT_A_SKELETON.filter((route) => routeSkeleton(hrefFor(route)) !== null)).toEqual(
			[]
		);
	});

	it('reads the route out of a guild href, whatever the guild is', () => {
		expect(routeSkeleton('/servers/931562055025168435/team')).not.toBeNull();
		expect(routeSkeleton('/servers/1/modules/welcome')).not.toBeNull();
	});

	it('ignores the query string, so a frozen preview still resolves', () => {
		expect(routeSkeleton('/servers/1/team?state=loading')).not.toBeNull();
	});

	it('has nothing for a route that does not exist', () => {
		expect(routeSkeleton('/servers/1/nowhere')).toBeNull();
	});
});
