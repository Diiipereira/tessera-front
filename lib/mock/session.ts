import type { Plan } from '@/lib/types/billing';
import type { SessionUser } from '@/lib/types/session';

export const mockUser: SessionUser = {
	id: '304918273645102938',
	displayName: 'lia',
	handle: '@lia.exe',
	initials: 'L',
	color: '#fbbf24',
	avatarUrl: null
};

export const mockPlan: Plan = {
	name: 'Pro plan',
	usage: { label: 'AutoMod rules', value: 17, max: 20 }
};

export const mockBotOnline = true;
