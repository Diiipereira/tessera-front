import { notFound } from 'next/navigation';
import { apiGet, apiGetPublic } from '@/lib/api';
import type { AuthenticatedUserDto, InvitePreviewDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
import { InviteScreen } from './InviteScreen';

export const metadata = { title: 'Invite' };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	const [preview, viewer] = await Promise.all([
		apiGetPublic<InvitePreviewDto>(`/invites/${token}`),
		apiGet<AuthenticatedUserDto>('/auth/me')
	]);

	if (preview.status === 'unauthenticated') notFound();

	if (preview.status === 'unreachable') {
		if (preview.httpStatus === 404) notFound();

		throw new ApiUnreachableError(preview.reason, preview.answered);
	}

	return <InviteScreen token={token} preview={preview.data} signedIn={viewer.status === 'ok'} />;
}
