import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';

export function LegalPage({ title }: { title: string }) {
	return (
		<div className="mx-auto flex min-h-svh max-w-180 flex-col gap-6 px-6 py-16">
			<h1 className="text-h1">{title}</h1>
			<p className="text-body-lg text-pretty text-text-muted">
				The legal copy for {BRAND.name} has not been written yet. This page exists so the sign-in
				screen never links into a dead end.
			</p>
			<div>
				<Button variant="outline" href="/login">
					Back to sign in
				</Button>
			</div>
		</div>
	);
}
