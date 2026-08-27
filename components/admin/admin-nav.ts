import { Ban, Building2 } from 'lucide-react';

export const adminNav = [
	{ id: 'tenants', label: 'Tenants', href: '/admin/tenants', icon: Building2 },
	{ id: 'blacklist', label: 'Blacklist', href: '/admin/blacklist', icon: Ban }
] as const;

export type AdminNavItem = (typeof adminNav)[number];

export function isAdminNavActive(pathname: string, href: string): boolean {
	return pathname === href || pathname.startsWith(`${href}/`);
}
