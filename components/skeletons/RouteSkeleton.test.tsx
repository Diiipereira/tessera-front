import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeSkeleton } from './RouteSkeleton';

const SHELL = resolve(import.meta.dirname, '../../app/(authenticated)/servers/[guildId]/(shell)');

const LOADING = 'loading.tsx';

function routesWithALoadingBoundary(): string[] {
	return readdirSync(SHELL, { recursive: true })
		.map((entry) => String(entry).replaceAll('\\', '/'))
		.filter((entry) => entry.endsWith(LOADING))
		.map((entry) => entry.slice(0, -LOADING.length).replace(/\/$/, ''));
}

const hrefFor = (route: string): string => (route === '' ? '/servers/1' : `/servers/1/${route}`);

describe('routeSkeleton', () => {
	it('finds every route that declares a loading boundary', () => {
		const missing = routesWithALoadingBoundary().filter(
			(route) => routeSkeleton(hrefFor(route)) === null
		);

		expect(missing).toEqual([]);
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
