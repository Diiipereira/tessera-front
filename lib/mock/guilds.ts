import type { Guild } from '@/lib/types/guild';

export const mockGuilds: Guild[] = [
	{
		id: '842315097461823104',
		name: 'Pixel Foundry',
		initials: 'PF',
		color: '#8b5cf6',
		memberCount: 12431,
		iconUrl: null,
		hasBot: true,
		tier: 'pro'
	},
	{
		id: '731204885219930112',
		name: 'Late Night Café',
		initials: 'LC',
		color: '#f87171',
		memberCount: 3908,
		iconUrl: null,
		hasBot: true,
		tier: 'free'
	},
	{
		id: '918273645510293847',
		name: 'Fórum dos Devs',
		initials: 'FD',
		color: '#4ade80',
		memberCount: 27650,
		iconUrl: null,
		hasBot: true,
		tier: 'ultimate'
	},
	{
		id: '556677889900112233',
		name: 'Sunset Raiders',
		initials: 'SR',
		color: '#fbbf24',
		memberCount: 812,
		iconUrl: null,
		hasBot: false,
		tier: 'free'
	}
];
