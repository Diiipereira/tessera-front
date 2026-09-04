import { render } from '@testing-library/react';
import { DoorOpen } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { Translated } from '@/tests/i18n';
import { ModulePage } from './ModulePage';

function renderPage() {
	const { container } = render(
		<ModulePage
			moduleId="welcome"
			icon={DoorOpen}
			title="Welcome"
			description="Greet whoever joins."
			enabled
			onEnabledChange={vi.fn()}
			saveBar={<div data-testid="save-bar" />}
		>
			<section />
		</ModulePage>,
		{ wrapper: Translated }
	);

	return container.firstElementChild as HTMLElement;
}

describe('ModulePage', () => {
	it('fills the scroll area, so a short screen still reaches the bottom', () => {
		const root = renderPage();

		expect(root.classList.contains('min-h-full')).toBe(true);
		expect(root.classList.contains('flex-col')).toBe(true);
	});

	it('gives the free space to the sections, so the save bar lands under them', () => {
		const root = renderPage();
		const beforeTheBar = root.children[root.children.length - 2];

		expect(beforeTheBar?.classList.contains('flex-1')).toBe(true);
	});
});
