import { Crown, Plus, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { botInviteUrl } from '@/lib/discord-invite';
import { guildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';
import { readableTextOn } from '@/lib/utils/contrast';

const TIER_LABELS: Record<string, string> = {
	pro: 'Pro',
	ultimate: 'Ultimate'
};

export function GuildCard({ guild }: { guild: Guild }) {
	const t = useTranslations('servers.card');
	const tierLabel = TIER_LABELS[guild.tier];
	const inviteHref = botInviteUrl(guild.id);
	const behind = guild.missingPermissions.length;

	return (
		<div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 shadow-1 transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong hover:shadow-2">
			{guild.iconUrl === null ? (
				<span
					aria-hidden="true"
					className={cn(
						'grid size-16 shrink-0 place-items-center rounded-lg text-h2 font-bold',
						guild.hasBot
							? readableTextOn(guild.color)
							: 'bg-surface-sunken text-text-muted opacity-60'
					)}
					style={guild.hasBot ? { backgroundColor: guild.color } : undefined}
				>
					{guild.initials}
				</span>
			) : (
				<Image
					src={guild.iconUrl}
					alt=""
					width={64}
					height={64}
					unoptimized
					className={cn('size-16 shrink-0 rounded-lg object-cover', !guild.hasBot && 'opacity-60')}
				/>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<h3 className={cn('truncate text-h4', !guild.hasBot && 'text-text-muted')}>
						{guild.name}
					</h3>
					{guild.hasBot && tierLabel ? (
						<Badge variant="primary" className="shrink-0">
							<Crown className="size-3" aria-hidden="true" />
							{tierLabel}
						</Badge>
					) : null}
					{behind > 0 ? (
						<Badge variant="warning" className="shrink-0">
							{t('behind', { count: behind })}
						</Badge>
					) : null}
				</div>

				<p className="tabular text-caption font-normal text-text-muted">
					{guild.hasBot ? t('members', { count: guild.memberCount }) : t('absent')}
				</p>

				<div className="mt-3 flex flex-wrap items-center gap-2">
					{guild.hasBot ? (
						<>
							<Button size="sm" href={guildHref(guild.id, '')}>
								{t('manage')}
							</Button>
							<Button
								size="sm"
								variant="outline"
								href={inviteHref ?? '/docs'}
								rel="external"
								disabled={inviteHref === null}
							>
								<RefreshCw aria-hidden="true" />
								{t('sync')}
							</Button>
						</>
					) : (
						<Button
							size="sm"
							variant="outline"
							href={inviteHref ?? '/docs'}
							rel="external"
							disabled={inviteHref === null}
						>
							<Plus aria-hidden="true" />
							{t('add')}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
