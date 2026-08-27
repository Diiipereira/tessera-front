import { Check, Hash, LayoutDashboard, SquareSlash } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { BRAND } from '@/lib/brand';
import { MIRROR_POINTS } from '@/lib/marketing';

function Panel({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
	return (
		<div className="overflow-hidden rounded-lg border border-border bg-surface shadow-1">
			<div className="flex items-center gap-2 border-b border-border bg-surface-sunken px-4 py-2.5">
				{icon}
				<span className="truncate font-mono text-caption font-normal text-text-muted">{label}</span>
			</div>
			{children}
		</div>
	);
}

function Connector() {
	return (
		<div className="flex items-center gap-3 px-4" aria-hidden="true">
			<svg viewBox="0 0 120 2" preserveAspectRatio="none" className="h-0.5 w-full overflow-visible">
				<line
					x1="0"
					y1="1"
					x2="120"
					y2="1"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeDasharray="4 8"
					strokeLinecap="round"
					className="animate-dash text-primary"
				/>
			</svg>
			<span className="font-mono text-overline whitespace-nowrap text-primary uppercase">
				same state
			</span>
			<svg viewBox="0 0 120 2" preserveAspectRatio="none" className="h-0.5 w-full overflow-visible">
				<line
					x1="0"
					y1="1"
					x2="120"
					y2="1"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeDasharray="4 8"
					strokeLinecap="round"
					className="animate-dash text-primary"
				/>
			</svg>
		</div>
	);
}

export function MirrorSplit() {
	return (
		<section className="border-b border-border bg-bg-subtle">
			<div className="mx-auto grid max-w-300 items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2">
				<div className="min-w-0">
					<p className="mb-3 font-mono text-overline text-text-muted uppercase">
						Configure anywhere
					</p>
					<h2 className="text-h1 text-pretty">
						The dashboard and the slash commands are the same thing
					</h2>
					<p className="mt-4 text-body-lg text-pretty text-text-muted">
						Your moderators live in Discord and never open a browser. You want a real settings page.
						Both write to the same state, so neither view is ever stale — and if someone changes a
						setting while your form is open, {BRAND.name} tells you instead of overwriting it.
					</p>

					<ul className="mt-6 flex flex-col gap-3">
						{MIRROR_POINTS.map((point) => (
							<li key={point} className="flex items-start gap-2.5">
								<span className="mt-0.75 grid size-5 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary">
									<Check className="size-3 stroke-[2.5]" aria-hidden="true" />
								</span>
								<span className="text-body text-pretty text-text-muted">{point}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="flex min-w-0 flex-col gap-3">
					<Panel
						icon={
							<LayoutDashboard className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
						}
						label="dashboard · /modules/welcome"
					>
						<div className="p-4">
							<p className="mb-1.5 text-body-sm font-medium">Welcome channel</p>
							<div className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3">
								<Hash className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
								<span className="min-w-0 flex-1 truncate text-body">welcome</span>
								<Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
							</div>
						</div>
					</Panel>

					<Connector />

					<Panel
						icon={<SquareSlash className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />}
						label="in Discord · #staff"
					>
						<div className="flex gap-3 p-4">
							<span
								aria-hidden="true"
								className="grid size-8 shrink-0 place-items-center rounded-full bg-warning text-body-sm font-bold text-on-light"
							>
								L
							</span>
							<div className="min-w-0">
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-body font-semibold">lia</span>
									<span className="text-caption font-normal text-text-muted">Today at 14:02</span>
								</div>
								<p className="mt-0.5 font-mono text-body-sm">
									<span className="text-primary">/welcome channel</span>{' '}
									<span className="text-text-muted">#welcome</span>
								</p>
								<Badge variant="success" dot className="mt-2">
									Applied
								</Badge>
							</div>
						</div>
					</Panel>
				</div>
			</div>
		</section>
	);
}
