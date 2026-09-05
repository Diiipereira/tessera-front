'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
	BookOpen,
	Check,
	ChevronRight,
	EllipsisVertical,
	LifeBuoy,
	LogOut,
	Sun,
	User
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { RefObject } from 'react';
import { useTheme, type ThemeMode } from '@/components/providers/theme-context';
import { SUPPORT_HREF } from '@/lib/support-links';
import type { SessionUser } from '@/lib/types/session';
import { cn } from '@/lib/utils/cn';
import { Avatar } from './Avatar';

const COMPACT_TRIGGER = 'rounded-full transition-opacity duration-120 ease-out hover:opacity-85';

const FULL_TRIGGER =
	'flex w-full items-center gap-2.5 rounded-md p-1 text-text transition-colors duration-120 ease-out hover:bg-surface-hover';

const item =
	'flex h-8 w-full cursor-default items-center gap-2 rounded-sm px-2 text-body text-text no-underline outline-none select-none data-[highlighted]:bg-surface-hover hover:no-underline';

const surface =
	'z-60 rounded-lg border border-border-strong bg-surface-raised p-1 shadow-2 data-[state=open]:animate-pop';

const themes: { mode: ThemeMode; labelKey: string }[] = [
	{ mode: 'light', labelKey: 'themeLight' },
	{ mode: 'dark', labelKey: 'themeDark' },
	{ mode: 'system', labelKey: 'themeSystem' }
];

type UserMenuProps = {
	user: SessionUser;
	onOpenAccount?: () => void;
	triggerRef?: RefObject<HTMLButtonElement | null>;
	collapsible?: boolean;
	compact?: boolean;
};

export function UserMenu({
	user,
	onOpenAccount,
	triggerRef,
	collapsible = false,
	compact = false
}: UserMenuProps) {
	const t = useTranslations('shell');
	const shared = useTranslations('common');
	const { mode, setMode } = useTheme();

	const triggerClass = compact
		? COMPACT_TRIGGER
		: cn(FULL_TRIGGER, collapsible && 'sidebar-collapsed:justify-center');

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger ref={triggerRef} aria-label={t('accountMenu')} className={triggerClass}>
				<Avatar initials={user.initials} color={user.color} src={user.avatarUrl} shape="circle" />
				{compact ? null : (
					<>
						<span
							className={cn('min-w-0 flex-1 text-left', collapsible && 'sidebar-collapsed:hidden')}
						>
							<span className="block truncate text-body">{user.displayName}</span>
							<span className="block truncate font-mono text-caption font-normal text-text-muted">
								{user.handle}
							</span>
						</span>
						<EllipsisVertical
							className={cn(
								'size-4 shrink-0 text-text-subtle',
								collapsible && 'sidebar-collapsed:hidden'
							)}
							aria-hidden="true"
						/>
					</>
				)}
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					side={compact ? 'bottom' : 'top'}
					align="end"
					sideOffset={6}
					className={cn(surface, 'w-59')}
				>
					{onOpenAccount === undefined ? null : (
						<DropdownMenu.Item className={item} onSelect={onOpenAccount}>
							<User className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
							<span className="flex-1">{t('account')}</span>
						</DropdownMenu.Item>
					)}

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className={item}>
							<Sun className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
							<span className="flex-1">{t('theme')}</span>
							<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent sideOffset={4} className={cn(surface, 'w-40')}>
								<DropdownMenu.RadioGroup
									value={mode}
									onValueChange={(value) => {
										setMode(value as ThemeMode);
									}}
								>
									{themes.map((option) => (
										<DropdownMenu.RadioItem key={option.mode} value={option.mode} className={item}>
											<span className="flex-1">{t(option.labelKey)}</span>
											{mode === option.mode ? (
												<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
											) : null}
										</DropdownMenu.RadioItem>
									))}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>

					<DropdownMenu.Item asChild>
						<Link href="/docs" className={item}>
							<BookOpen className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
							<span className="flex-1">{t('docs')}</span>
						</Link>
					</DropdownMenu.Item>

					{SUPPORT_HREF === null ? (
						<DropdownMenu.Item disabled className={cn(item, 'opacity-55')}>
							<LifeBuoy className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
							<span className="flex-1">{t('support')}</span>
							<span className="sr-only">{shared('notAvailable')}</span>
						</DropdownMenu.Item>
					) : (
						<DropdownMenu.Item asChild>
							<a href={SUPPORT_HREF} rel="external" className={item}>
								<LifeBuoy className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
								<span className="flex-1">{t('support')}</span>
							</a>
						</DropdownMenu.Item>
					)}

					<DropdownMenu.Separator className="my-1 h-px bg-border" />

					<DropdownMenu.Item asChild>
						<Link href="/logout" className={item}>
							<LogOut className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
							<span className="flex-1">{t('signOut')}</span>
						</Link>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
