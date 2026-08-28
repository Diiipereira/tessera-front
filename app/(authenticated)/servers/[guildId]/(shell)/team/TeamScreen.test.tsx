import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CapabilityCatalogDto, InviteDto, TeamListDto, TeamSeatDto } from '@/lib/api-url';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { TeamScreen } from './TeamScreen';

const refresh = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();
const putSeat = vi.fn();
const deleteSeat = vi.fn();
const mintInvite = vi.fn();
const revokeInvite = vi.fn();
const writeText = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: (...args: unknown[]) => toastSuccess(...args) as unknown
	}
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh })
}));

vi.mock('@/lib/team-client', () => ({
	putSeat: (...args: unknown[]) => putSeat(...args) as unknown,
	deleteSeat: (...args: unknown[]) => deleteSeat(...args) as unknown
}));

vi.mock('@/lib/invite-client', () => ({
	mintInvite: (...args: unknown[]) => mintInvite(...args) as unknown,
	revokeInvite: (...args: unknown[]) => revokeInvite(...args) as unknown
}));

const GUILD_ID = '842315097461823104';
const OWNER_ID = '304918273645102938';
const ADMIN_ID = '512038475610293847';
const VIEWER_ID = '628374651029384756';

const catalog: CapabilityCatalogDto = {
	capabilities: [
		{
			key: 'modules.read',
			label: 'capabilities.modules.read.label',
			description: 'capabilities.modules.read.description'
		},
		{
			key: 'modules.write',
			label: 'capabilities.modules.write.label',
			description: 'capabilities.modules.write.description'
		}
	],
	roles: ['owner', 'admin', 'moderator', 'viewer'],
	presets: {
		owner: ['modules.read', 'modules.write', 'team.manage'],
		admin: ['modules.read', 'modules.write', 'team.manage'],
		moderator: ['modules.read'],
		viewer: ['modules.read']
	}
};

const seat = (over: Partial<TeamSeatDto> & Pick<TeamSeatDto, 'userId'>): TeamSeatDto => ({
	username: 'someone',
	globalName: null,
	avatarHash: null,
	role: 'viewer',
	source: 'guild-staff',
	grantedBy: 'lia',
	grantedAt: '2026-08-20T10:00:00.000Z',
	lastSeenAt: '2026-08-27T10:00:00.000Z',
	...over
});

const team: TeamListDto = {
	viewerId: ADMIN_ID,
	viewerRole: 'admin',
	seats: [
		seat({
			userId: OWNER_ID,
			username: 'lia.exe',
			globalName: 'lia',
			role: 'owner',
			source: 'guild-owner',
			grantedBy: null,
			grantedAt: null
		}),
		seat({ userId: ADMIN_ID, username: 'okra', globalName: 'okra', role: 'admin' }),
		seat({ userId: VIEWER_ID, username: 'panela.dev', role: 'viewer', lastSeenAt: null })
	]
};

const INVITE: InviteDto = {
	id: 'b7c1a2d3-0000-4000-8000-000000000001',
	url: 'http://localhost:3000/invite/a-very-long-opaque-token',
	role: 'moderator',
	createdBy: 'lia',
	createdAt: '2026-08-28T09:00:00.000Z',
	expiresAt: '2026-09-04T09:00:00.000Z'
};

function renderScreen(
	over: Partial<TeamListDto> = {},
	invites: InviteDto[] = [],
	invitesFailed = false
) {
	return render(
		<Translated>
			<TeamScreen
				guildId={GUILD_ID}
				catalog={catalog}
				team={{ ...team, ...over }}
				invites={invites}
				invitesFailed={invitesFailed}
				now="2026-08-28T10:00:00.000Z"
			/>
		</Translated>
	);
}

const sectionOf = (title: string): HTMLElement => {
	const section = screen.getByRole('heading', { name: title }).closest('section');

	if (section === null) throw new Error(`"${title}" is not inside a section`);

	return section;
};

const accessRows = (): HTMLElement[] =>
	within(sectionOf(enUS.team.access.title)).getAllByRole('row');

const rowFor = (name: string): HTMLElement => {
	const row = accessRows().find((entry) => entry.textContent.includes(name));

	if (row === undefined) throw new Error(`No access row for ${name}`);

	return row;
};

beforeEach(() => {
	vi.clearAllMocks();
	putSeat.mockResolvedValue({ status: 'saved', seat: seat({ userId: VIEWER_ID }) });
	deleteSeat.mockResolvedValue({ status: 'removed' });
	mintInvite.mockResolvedValue({ status: 'minted', invite: INVITE });
	revokeInvite.mockResolvedValue({ status: 'revoked' });
	writeText.mockResolvedValue(undefined);
	Object.defineProperty(navigator, 'clipboard', {
		value: { writeText },
		configurable: true
	});
});

describe('TeamScreen access table', () => {
	it('lists one row per seat the API sent, not a list of its own', () => {
		renderScreen();

		expect(accessRows().slice(1)).toHaveLength(team.seats.length);
	});

	it('shows the handle the API sent, so nothing is invented locally', () => {
		renderScreen();

		expect(within(rowFor('panela.dev')).getByText('@panela.dev')).toBeDefined();
	});

	it('credits Discord for the owner seat, which no grant created', () => {
		renderScreen();

		expect(within(rowFor('lia')).getByText(enUS.team.access.fromDiscord)).toBeDefined();
	});

	it('says never for someone who has not signed in, rather than a bogus date', () => {
		renderScreen();

		expect(within(rowFor('panela.dev')).getByText(enUS.team.access.never)).toBeDefined();
	});

	it('marks which row is you', () => {
		renderScreen();

		expect(within(rowFor('okra')).getByText(enUS.team.access.you)).toBeDefined();
	});

	it('leaves the owner seat and your own seat without controls, as the API refuses both', () => {
		renderScreen();

		expect(within(rowFor('lia')).queryByRole('combobox')).toBeNull();
		expect(within(rowFor('okra')).queryByRole('combobox')).toBeNull();
		expect(within(rowFor('panela.dev')).getByRole('combobox')).toBeDefined();
	});

	it('offers no control at all to a seat that cannot manage the team', () => {
		renderScreen({ viewerId: VIEWER_ID, viewerRole: 'viewer' });

		expect(within(sectionOf(enUS.team.access.title)).queryByRole('combobox')).toBeNull();
		expect(screen.getByRole('button', { name: enUS.team.add })).toBeDisabled();
	});
});

describe('TeamScreen writes', () => {
	it('removes a seat through the API and reloads the page data', async () => {
		renderScreen();

		await userEvent.click(
			within(rowFor('panela.dev')).getByRole('button', {
				name: enUS.team.access.remove.replace('{name}', 'panela.dev')
			})
		);

		await waitFor(() => {
			expect(deleteSeat).toHaveBeenCalledWith(GUILD_ID, VIEWER_ID);
		});
		expect(refresh).toHaveBeenCalled();
	});

	it('keeps the row and reports the reason when the API refuses', async () => {
		deleteSeat.mockResolvedValue({ status: 'error', message: 'You cannot change your own seat' });
		renderScreen();

		await userEvent.click(
			within(rowFor('panela.dev')).getByRole('button', {
				name: enUS.team.access.remove.replace('{name}', 'panela.dev')
			})
		);

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith('You cannot change your own seat');
		});
		expect(refresh).not.toHaveBeenCalled();
	});

	it('never asks for a name or an id, since the link carries neither', async () => {
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));

		expect(screen.queryByRole('textbox')).toBeNull();
	});

	it('mints the link for the seat that was picked', async () => {
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));
		await userEvent.click(screen.getByRole('button', { name: enUS.team.dialog.submit }));

		await waitFor(() => {
			expect(mintInvite).toHaveBeenCalledWith(GUILD_ID, 'viewer');
		});
	});

	it('shows the minted link so it can be sent to somebody', async () => {
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));
		await userEvent.click(screen.getByRole('button', { name: enUS.team.dialog.submit }));

		await waitFor(() => {
			expect(screen.getByTestId('invite-link').textContent).toBe(INVITE.url);
		});
	});

	it('copies the link to the clipboard, which is the whole point of showing it', async () => {
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));
		await userEvent.click(screen.getByRole('button', { name: enUS.team.dialog.submit }));
		await waitFor(() => {
			expect(screen.getByTestId('invite-link')).toBeDefined();
		});

		await userEvent.click(screen.getByRole('button', { name: enUS.team.dialog.copy }));

		expect(writeText).toHaveBeenCalledWith(INVITE.url);
	});

	it('shows no link and says why when minting is refused', async () => {
		mintInvite.mockResolvedValue({ status: 'error', message: 'Guild has no bot installed' });
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));
		await userEvent.click(screen.getByRole('button', { name: enUS.team.dialog.submit }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith('Guild has no bot installed');
		});
		expect(screen.queryByTestId('invite-link')).toBeNull();
	});
});

describe('TeamScreen invite links', () => {
	const linksSection = (): HTMLElement => sectionOf(enUS.team.links.title);

	it('lists the links the API sent', () => {
		renderScreen({}, [INVITE]);

		expect(within(linksSection()).getByText(enUS.team.role.moderator)).toBeDefined();
	});

	it('shows no section at all when there is no open link', () => {
		renderScreen({}, []);

		expect(screen.queryByRole('heading', { name: enUS.team.links.title })).toBeNull();
	});

	it('hides the links from a seat that cannot manage the team', () => {
		renderScreen({ viewerId: VIEWER_ID, viewerRole: 'viewer' }, [INVITE]);

		expect(screen.queryByRole('heading', { name: enUS.team.links.title })).toBeNull();
	});

	it('revokes a link through the API and reloads', async () => {
		renderScreen({}, [INVITE]);

		await userEvent.click(
			within(linksSection()).getByRole('button', { name: enUS.team.links.revoke })
		);

		await waitFor(() => {
			expect(revokeInvite).toHaveBeenCalledWith(GUILD_ID, INVITE.id);
		});
		expect(refresh).toHaveBeenCalled();
	});

	it('keeps the rest of the page when the links panel could not be loaded', () => {
		renderScreen({}, [], true);

		expect(screen.getByRole('heading', { name: enUS.team.access.title })).toBeDefined();
		expect(screen.getByRole('heading', { name: enUS.team.matrix.title })).toBeDefined();
		expect(screen.getByText(enUS.team.links.unavailableTitle)).toBeDefined();
	});

	it('shows the failure instead of an empty list, so nothing looks fine when it is not', () => {
		renderScreen({}, [], true);

		expect(screen.queryByRole('heading', { name: enUS.team.links.title })).toBeNull();
	});

	it('says nothing about links to a seat that cannot manage them, even on failure', () => {
		renderScreen({ viewerId: VIEWER_ID, viewerRole: 'viewer' }, [], true);

		expect(screen.queryByText(enUS.team.links.unavailableTitle)).toBeNull();
	});

	it('copies a listed link without minting a new one', async () => {
		renderScreen({}, [INVITE]);

		await userEvent.click(
			within(linksSection()).getByRole('button', { name: enUS.team.links.copy })
		);

		expect(writeText).toHaveBeenCalledWith(INVITE.url);
		expect(mintInvite).not.toHaveBeenCalled();
	});
});

describe('TeamScreen matrix', () => {
	it('lists one row per capability the API sent', () => {
		renderScreen();

		expect(within(sectionOf(enUS.team.matrix.title)).getAllByRole('row').slice(1)).toHaveLength(
			catalog.capabilities.length
		);
	});

	it('marks a capability granted for one seat and withheld for another', () => {
		renderScreen();

		const row = within(sectionOf(enUS.team.matrix.title))
			.getAllByRole('row')
			.find((entry) => entry.textContent.includes(enUS.capabilities.modules.write.label));

		expect(within(row as HTMLElement).getAllByText(enUS.team.granted)).toHaveLength(2);
		expect(within(row as HTMLElement).getAllByText(enUS.team.notGranted)).toHaveLength(2);
	});

	it('names the Discord fallback seat as Admin, which is the role the API grants', () => {
		renderScreen();

		expect(screen.getByText(enUS.team.discordTitle).closest('div')?.textContent).toContain(
			enUS.team.role.admin
		);
	});
});
