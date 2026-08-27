import { afterEach, describe, expect, it, vi } from 'vitest';
import { holdSkeleton, skeletonHoldMs } from './skeleton-hold';

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('skeletonHoldMs', () => {
	it('never holds outside development', () => {
		for (const env of ['production', 'test']) {
			vi.stubEnv('NODE_ENV', env);
			vi.stubEnv('SKELETON_HOLD_MS', '5000');
			expect(skeletonHoldMs()).toBe(0);
		}
	});

	it('holds three seconds in development by default', () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.stubEnv('SKELETON_HOLD_MS', '');
		expect(skeletonHoldMs()).toBe(3000);
	});

	it('takes an override, and zero turns it off', () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.stubEnv('SKELETON_HOLD_MS', '800');
		expect(skeletonHoldMs()).toBe(800);

		vi.stubEnv('SKELETON_HOLD_MS', '0');
		expect(skeletonHoldMs()).toBe(0);
	});

	it('falls back to the default when the override is not a number', () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.stubEnv('SKELETON_HOLD_MS', 'devagar');
		expect(skeletonHoldMs()).toBe(3000);
	});
});

describe('holdSkeleton', () => {
	it('resolves without a timer when there is nothing to hold', async () => {
		vi.stubEnv('NODE_ENV', 'production');
		const timer = vi.spyOn(globalThis, 'setTimeout');

		await holdSkeleton({});

		expect(timer).not.toHaveBeenCalled();
		timer.mockRestore();
	});

	it('never delays the frozen preview', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		const timer = vi.spyOn(globalThis, 'setTimeout');

		await holdSkeleton({ state: 'loading' });

		expect(timer).not.toHaveBeenCalled();
		timer.mockRestore();
	});

	it('waits the configured time', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.stubEnv('SKELETON_HOLD_MS', '3000');
		vi.useFakeTimers();

		let done = false;
		const held = holdSkeleton({}).then(() => (done = true));

		await vi.advanceTimersByTimeAsync(2999);
		expect(done).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		await held;
		expect(done).toBe(true);

		vi.useRealTimers();
	});
});
