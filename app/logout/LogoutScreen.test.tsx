import { render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LogoutScreen } from './LogoutScreen';

const push = vi.fn();
const success = vi.fn();
const failure = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push })
}));

vi.mock('sonner', () => ({
	toast: {
		success: (message: string, data?: { id?: string }) => {
			success(message, data);
		},
		error: (message: string, data?: { id?: string }) => {
			failure(message, data);
		}
	}
}));

const fetchMock = vi.fn();

describe('LogoutScreen', () => {
	beforeEach(() => {
		push.mockClear();
		success.mockClear();
		failure.mockClear();
		fetchMock.mockReset();
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
		vi.stubGlobal('fetch', fetchMock);
	});

	it('tells the API to revoke the session before leaving', async () => {
		render(<LogoutScreen />);

		await waitFor(() => {
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

		expect(url).toBe('http://localhost:3001/auth/logout');
		expect(init.method).toBe('POST');
		expect(init.credentials).toBe('include');
	});

	it('sends the user home once the revocation answered', async () => {
		render(<LogoutScreen />);

		await waitFor(() => {
			expect(push).toHaveBeenCalledWith('/');
		});

		expect(success).toHaveBeenCalled();
	});

	it('still sends the user home when the API is unreachable, and says so', async () => {
		fetchMock.mockRejectedValue(new Error('connection refused'));

		render(<LogoutScreen />);

		await waitFor(() => {
			expect(push).toHaveBeenCalledWith('/');
		});

		expect(failure).toHaveBeenCalled();
		expect(success).not.toHaveBeenCalled();
	});

	it('revokes once even when the effect is mounted twice', async () => {
		render(
			<StrictMode>
				<LogoutScreen />
			</StrictMode>
		);

		await waitFor(() => {
			expect(push).toHaveBeenCalledWith('/');
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('gives the toast a stable id, so a remount updates it instead of stacking a second one', async () => {
		render(
			<StrictMode>
				<LogoutScreen />
			</StrictMode>
		);

		await waitFor(() => {
			expect(success).toHaveBeenCalled();
		});

		const ids = success.mock.calls.map((call) => (call[1] as { id?: string } | undefined)?.id);

		expect(new Set(ids).size).toBe(1);
		expect(ids[0]).toBeTypeOf('string');
	});
});
