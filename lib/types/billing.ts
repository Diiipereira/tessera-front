export type PlanTier = 'free' | 'pro' | 'ultimate';

export type PlanUsage = {
	label: string;
	value: number;
	max: number;
};

export type Plan = {
	name: string;
	usage: PlanUsage;
};
