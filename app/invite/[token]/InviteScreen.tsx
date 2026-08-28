'use client';

import { Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { signInHref, type InvitePreviewDto } from '@/lib/api-url';
import { acceptInvite } from '@/lib/invite-client';

type InviteScreenProps = {
	token: string;
	preview: InvitePreviewDto;
	signedIn: boolean;
};

export function InviteScreen({ token, preview, signedIn }: InviteScreenProps) {
	const t = useTranslations('invitePage');
	const roles = useTranslations('team.role');
	const router = useRouter();
	const [busy, setBusy] = useState(false);

	const role = roles(preview.role);

	const accept = async (): Promise<void> => {
		setBusy(true);
		const result = await acceptInvite(token);

		if (result.status === 'error') {
			setBusy(false);
			toast.error(result.message);
			return;
		}

		router.replace(`/servers/${result.accepted.guildId}`);
	};

	return (
		<main className="grid min-h-dvh place-items-center p-6">
			<div className="flex w-full max-w-md flex-col items-center gap-5 rounded-lg border border-border bg-surface p-8 text-center">
				<span className="grid size-12 place-items-center rounded-full bg-surface-sunken">
					<Link2 className="size-6 text-text-muted" aria-hidden="true" />
				</span>

				{preview.state === 'open' ? (
					<>
						<h1 className="text-h2">{t('title', { guild: preview.guildName })}</h1>
						<p className="text-body text-text-muted">{t('body', { role })}</p>

						{signedIn ? (
							<Button
								disabled={busy}
								onClick={() => {
									void accept();
								}}
							>
								{t('accept')}
							</Button>
						) : (
							<Button
								onClick={() => {
									window.location.assign(signInHref(`/invite/${token}`));
								}}
							>
								{t('signIn')}
							</Button>
						)}
					</>
				) : (
					<>
						<h1 className="text-h2">{t(`dead.${preview.state}.title`)}</h1>
						<p className="text-body text-text-muted">{t(`dead.${preview.state}.body`)}</p>
					</>
				)}
			</div>
		</main>
	);
}
