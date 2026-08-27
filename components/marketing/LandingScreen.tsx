import { SessionProvider } from '@/components/providers/SessionProvider';
import type { LoginError } from '@/lib/auth';
import { ClosingCta } from './ClosingCta';
import { Faq } from './Faq';
import { HelpCards } from './HelpCards';
import { Hero } from './Hero';
import { MirrorSplit } from './MirrorSplit';
import { ModuleGrid } from './ModuleGrid';
import { PublicFooter } from './PublicFooter';
import { PublicHeader } from './PublicHeader';
import { SignInCardConnected } from './SignInCardConnected';

type LandingScreenProps = {
	error?: LoginError | null;
	signInFirst?: boolean;
};

export function LandingScreen({ error = null, signInFirst = false }: LandingScreenProps) {
	return (
		<SessionProvider>
			<div className="min-h-svh bg-bg">
				<PublicHeader />
				<main>
					<Hero card={<SignInCardConnected error={error} />} cardFirst={signInFirst} />
					<ModuleGrid />
					<MirrorSplit />
					<HelpCards />
					<Faq />
					<ClosingCta />
				</main>
				<PublicFooter />
			</div>
		</SessionProvider>
	);
}
