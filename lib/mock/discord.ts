import { BRAND } from '@/lib/brand';
import type { Channel, Role } from '@/lib/types/discord';

const WELCOME = '901234567890120001';
const COMMUNITY = '901234567890120002';
const STAFF = '901234567890120003';

export const mockChannels: Channel[] = [
	{
		id: '901234567890123001',
		name: 'welcome',
		categoryId: WELCOME,
		category: 'Welcome',
		kind: 'text'
	},
	{
		id: '901234567890123002',
		name: 'rules',
		categoryId: WELCOME,
		category: 'Welcome',
		kind: 'text',
		lockedReason: `${BRAND.name} needs Send Messages in #rules`
	},
	{
		id: '901234567890123003',
		name: 'announcements',
		categoryId: WELCOME,
		category: 'Welcome',
		kind: 'announcement'
	},
	{
		id: '901234567890123004',
		name: 'general',
		categoryId: COMMUNITY,
		category: 'Community',
		kind: 'text'
	},
	{
		id: '901234567890123005',
		name: 'screenshots',
		categoryId: COMMUNITY,
		category: 'Community',
		kind: 'text'
	},
	{
		id: '901234567890123006',
		name: 'help-forum',
		categoryId: COMMUNITY,
		category: 'Community',
		kind: 'forum'
	},
	{
		id: '901234567890123007',
		name: 'lounge',
		categoryId: COMMUNITY,
		category: 'Community',
		kind: 'voice',
		lockedReason: `${BRAND.name} can't post in voice channels`
	},
	{
		id: '901234567890123008',
		name: 'mod-log',
		categoryId: STAFF,
		category: 'Staff',
		kind: 'text'
	},
	{
		id: '901234567890123009',
		name: 'staff-chat',
		categoryId: STAFF,
		category: 'Staff',
		kind: 'text'
	}
];

export const mockRoles: Role[] = [
	{ id: '801234567890123001', name: 'Member', color: '#57f287', memberCount: 12104 },
	{ id: '801234567890123010', name: 'Admin', color: '#ed4245', memberCount: 3 },
	{ id: '801234567890123011', name: 'Staff', color: '#5865f2', memberCount: 14 },
	{ id: '801234567890123012', name: 'Trial Mod', color: '#eb459e', memberCount: 5 },
	{ id: '801234567890123002', name: 'Verified', color: '#3ba55d', memberCount: 9882 },
	{ id: '801234567890123003', name: 'Booster', color: '#f47fff', memberCount: 146 },
	{ id: '801234567890123004', name: 'Event Host', color: '#fee75c', memberCount: 12 },
	{
		id: '801234567890123005',
		name: 'Moderator',
		color: '#5865f2',
		memberCount: 8,
		lockedReason: `${BRAND.name}'s role must be above this role`
	}
];
