import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { isDark, useTheme } from './theme-context';

const seen: string[] = [];

function Consumer() {
	const { resolved, setMode } = useTheme();

	useEffect(() => {
		seen.push(document.documentElement.className);
	}, [resolved]);

	return (
		<button
			type="button"
			onClick={() => {
				setMode('dark');
			}}
		>
			go dark
		</button>
	);
}

beforeEach(() => {
	seen.length = 0;
	localStorage.clear();
	document.documentElement.className = '';
});

afterEach(() => {
	localStorage.clear();
	document.documentElement.className = '';
});

describe('isDark', () => {
	it('follows an explicit choice whatever the system says', () => {
		expect(isDark('dark', false)).toBe(true);
		expect(isDark('light', true)).toBe(false);
	});

	it('defers to the system only on "system"', () => {
		expect(isDark('system', true)).toBe(true);
		expect(isDark('system', false)).toBe(false);
	});
});

describe('ThemeProvider', () => {
	it('has the class on the document before a child effect runs', async () => {
		const user = userEvent.setup();
		render(
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		);

		seen.length = 0;
		await user.click(screen.getByRole('button', { name: 'go dark' }));

		expect(seen.at(-1)).toContain('dark');
	});

	it('takes the class back off when the choice goes the other way', () => {
		localStorage.setItem('tessera:theme', 'dark');
		document.documentElement.className = 'dark';

		render(
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		);

		expect(document.documentElement.className).toContain('dark');
	});

	it('reports the resolved theme it actually applied', async () => {
		const user = userEvent.setup();
		render(
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		);

		await user.click(screen.getByRole('button', { name: 'go dark' }));

		expect(document.documentElement.classList.contains('dark')).toBe(true);
		expect(localStorage.getItem('tessera:theme')).toBe('dark');
	});
});
