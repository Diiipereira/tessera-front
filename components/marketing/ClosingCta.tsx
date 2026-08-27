import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import { INVITE_HREF } from '@/lib/discord-invite';

export function ClosingCta() {
	return (
		<section className="border-b border-border">
			<div className="mx-auto max-w-300 px-6 py-20 sm:px-8">
				<div className="relative overflow-hidden rounded-2xl border border-border px-6 py-14 text-center sm:px-10">
					<div className="absolute inset-0 brand-mesh" aria-hidden="true" />

					<div className="relative">
						<h2 className="text-h1 text-pretty">Add {BRAND.name} to a server in about a minute</h2>
						<p className="mx-auto mt-3 max-w-[52ch] text-body-lg text-pretty text-text-muted">
							Free on unlimited servers. The setup wizard walks you through the log channel and
							moderator roles, and you can skip it.
						</p>
						<div className="mt-7 flex flex-wrap justify-center gap-3">
							<Button size="xl" href={INVITE_HREF} rel="external">
								<Plus aria-hidden="true" />
								Add {BRAND.name} to Discord
							</Button>
							<Button size="xl" variant="outline" href="/docs">
								Read the docs
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
