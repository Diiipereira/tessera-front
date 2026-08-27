import type { Member, MemberStanding } from '@/lib/types/management';

export type MemberSort = 'joined' | 'level' | 'balance' | 'warnings' | 'name';

export const STANDING_LABELS: Record<MemberStanding, string> = {
	clean: 'Clean',
	warned: 'Warned',
	'timed-out': 'Timed out',
	banned: 'Banned'
};

export function warningCount(member: Member): number {
	return member.infractions.filter((entry) => entry.action === 'warn').length;
}

export type MemberFilters = {
	query: string;
	roleId: string;
	standing: MemberStanding | 'all';
};

export function filterMembers(members: Member[], filters: MemberFilters): Member[] {
	const term = filters.query.trim().toLowerCase();

	return members.filter((member) => {
		if (filters.roleId !== 'all' && !member.roleIds.includes(filters.roleId)) return false;
		if (filters.standing !== 'all' && member.standing !== filters.standing) return false;
		if (term === '') return true;
		return (
			member.name.toLowerCase().includes(term) ||
			member.handle.toLowerCase().includes(term) ||
			member.id.includes(term)
		);
	});
}

export function sortMembers(members: Member[], sort: MemberSort): Member[] {
	const copy = [...members];

	switch (sort) {
		case 'joined':
			return copy.sort((a, b) => Date.parse(b.joinedAt) - Date.parse(a.joinedAt));
		case 'level':
			return copy.sort((a, b) => b.level - a.level || b.xp - a.xp);
		case 'balance':
			return copy.sort((a, b) => b.balance - a.balance);
		case 'warnings':
			return copy.sort((a, b) => warningCount(b) - warningCount(a));
		case 'name':
			return copy.sort((a, b) => a.name.localeCompare(b.name));
	}
}
