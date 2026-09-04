import { apiBaseUrl } from '@/lib/api-url';

const CATALOG_REVALIDATE_SECONDS = 3600;

export type CatalogOption = {
	value: string;
	i18nLabel: string;
};

export type CatalogField = {
	key: string;
	type: string;
	i18nLabel: string;
	i18nDescription: string;
	required: boolean;
	default?: unknown;
	options?: CatalogOption[];
	constraints?: Record<string, number | string | boolean | string[]>;
};

export type CatalogModule = {
	key: string;
	category: string;
	i18nLabel: string;
	i18nDescription: string;
	fields: CatalogField[];
};

export type CatalogCommand = {
	name: string;
	module: string | null;
};

async function read<T>(path: string): Promise<T | null> {
	try {
		const response = await fetch(`${apiBaseUrl()}${path}`, {
			next: { revalidate: CATALOG_REVALIDATE_SECONDS }
		});

		if (!response.ok) return null;

		return (await response.json()) as T;
	} catch {
		return null;
	}
}

export async function loadModuleCatalog(): Promise<CatalogModule[]> {
	const body = await read<{ modules: CatalogModule[] }>('/modules');

	return body?.modules ?? [];
}

export async function loadCommandCatalog(): Promise<CatalogCommand[]> {
	const body = await read<{ commands: CatalogCommand[] }>('/commands');

	return body?.commands ?? [];
}

export const fieldsOf = (catalog: CatalogModule[], key: string): CatalogField[] =>
	catalog.find((module) => module.key === key)?.fields ?? [];

export const commandsOf = (catalog: CatalogCommand[], key: string): CatalogCommand[] =>
	catalog.filter((command) => command.module === key);
