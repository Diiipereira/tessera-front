'use client';

import { Bot, Check, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BrandMark } from '@/components/auth/BrandMark';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import type { ExternalHref } from '@/lib/discord-invite';
import { guildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';
import { cn } from '@/lib/utils/cn';

const HANDOFF_MS = 1400;

const DOTS = [0, 1, 2];

type AddServerScreenProps = {
	guild: Guild | null;
	joined: boolean;
	inviteHref: ExternalHref | null;
};

export function AddServerScreen({ guild, joined, inviteHref }: AddServerScreenProps) {
	const t = useTranslations('servers.add');
	const common = useTranslations('common');
	const router = useRouter();
	const setupHref = guild ? guildHref(guild.id, '/setup') : null;

	useEffect(() => {
		if (!joined || !setupHref) return;
		const timer = setTimeout(() => {
			router.push(setupHref);
		}, HANDOFF_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [joined, setupHref, router]);

	return (
		<div className="grid min-h-svh place-items-center bg-bg px-6 py-12">
			<div className="flex w-full max-w-120 flex-col items-center gap-5 rounded-xl border border-border bg-surface p-8 text-center shadow-1">
				<div className="flex items-center gap-3">
					<span className="grid size-12 place-items-center rounded-lg bg-discord text-discord-fg">
						<Bot className="size-6" aria-hidden="true" />
					</span>

					<span className="flex items-center gap-1.5" aria-hidden="true">
						{DOTS.map((dot) => (
							<span
								key={dot}
								className={cn(
									'size-1.5 animate-pulse rounded-full',
									joined ? 'bg-success' : 'bg-primary'
								)}
								style={{ animationDelay: `${String(dot * 200)}ms` }}
							/>
						))}
					</span>

					{joined ? (
						<span className="grid size-12 place-items-center rounded-lg bg-success-subtle text-success">
							<Check className="size-6" aria-hidden="true" />
						</span>
					) : (
						<BrandMark size="lg" />
					)}
				</div>

				{joined ? (
					<div>
						<h1 className="text-h3">
							{guild
								? t('joined', { brand: BRAND.name, guild: guild.name })
								: t('joinedUnknown', { brand: BRAND.name })}
						</h1>
						<p className="text-body-sm text-text-muted">{t('toSetup')}</p>
					</div>
				) : (
					<>
						<div>
							<h1 className="flex items-center justify-center gap-2 text-h3">
								<span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
								{guild
									? t('waiting', { brand: BRAND.name, guild: guild.name })
									: t('waitingUnknown', { brand: BRAND.name })}
							</h1>
							<p className="text-body-sm text-pretty text-text-muted">{t('authorize')}</p>
						</div>

						<div className="flex flex-wrap justify-center gap-2">
							{inviteHref === null ? null : (
								<Button href={inviteHref} rel="external">
									<ExternalLink aria-hidden="true" />
									{guild ? t('inviteTo', { guild: guild.name }) : t('invite')}
								</Button>
							)}
							<Button variant="outline" href="/servers">
								{common('cancel')}
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
