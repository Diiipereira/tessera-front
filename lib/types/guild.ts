import type { PlanTier } from './billing';

export type Guild = {
	id: string;
	name: string;
	initials: string;
	color: string;
	iconUrl: string | null;
	memberCount: number;
	hasBot: boolean;
	tier: PlanTier;
};
