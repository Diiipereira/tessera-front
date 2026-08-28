import type { Role } from '@/lib/types/discord';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

type RoleChipsProps = {
	roles: Role[];
	roleIds: string[];
	max?: number;
	className?: string;
};

export function RoleChips({ roles, roleIds, max = 3, className }: RoleChipsProps) {
	const t = useTranslations('pickers');
	const matched = roleIds
		.map((id) => roles.find((role) => role.id === id))
		.filter((role): role is Role => role !== undefined);

	if (matched.length === 0) {
		return <span className={cn('text-body-sm text-text-muted', className)}>{t('noRoles')}</span>;
	}

	const shown = matched.slice(0, max);
	const hidden = matched.length - shown.length;

	return (
		<div className={cn('flex flex-wrap items-center gap-1.5', className)}>
			{shown.map((role) => (
				<span
					key={role.id}
					className="inline-flex h-5 items-center gap-1.5 rounded-sm border border-border bg-surface-sunken px-1.5 text-caption text-text-muted"
				>
					<span
						className="size-1.5 shrink-0 rounded-full"
						style={{ backgroundColor: role.color }}
						aria-hidden="true"
					/>
					{role.name}
				</span>
			))}
			{hidden > 0 ? <span className="text-caption text-text-muted">+{hidden}</span> : null}
		</div>
	);
}
