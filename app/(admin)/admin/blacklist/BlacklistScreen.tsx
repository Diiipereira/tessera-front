'use client';

import { Ban, Plus, ShieldX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/management/ConfirmDialog';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Textarea } from '@/components/ui/Textarea';
import { filterBlacklist, isExpired, isSnowflake } from '@/lib/admin';
import { absoluteTime, dateOnly, relativeTime } from '@/lib/time';
import type { BlacklistEntry, BlacklistTargetType } from '@/lib/types/admin';

export function BlacklistScreen({ entries }: { entries: BlacklistEntry[] }) {
	const [query, setQuery] = useState('');
	const [targetType, setTargetType] = useState<BlacklistTargetType | 'all'>('all');
	const [includeExpired, setIncludeExpired] = useState(false);
	const [adding, setAdding] = useState(false);
	const [removing, setRemoving] = useState<BlacklistEntry | null>(null);

	const [draftId, setDraftId] = useState('');
	const [draftReason, setDraftReason] = useState('');

	const visible = filterBlacklist(entries, { query, targetType, includeExpired });
	const idValid = isSnowflake(draftId);

	function closeAdd() {
		setDraftId('');
		setDraftReason('');
		setAdding(false);
	}

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title="Blacklist"
				description="Users and servers the platform refuses. Checked when a session is issued, before anything else."
				action={
					<Button
						onClick={() => {
							setAdding(true);
						}}
					>
						<Plus aria-hidden="true" />
						Add entry
					</Button>
				}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search by name, id or reason…"
					aria-label="Search the blacklist"
					className="max-w-80"
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: 'All' },
						{ value: 'user', label: 'Users' },
						{ value: 'guild', label: 'Servers' }
					]}
					value={targetType}
					onValueChange={setTargetType}
					label="Filter by target"
					size="sm"
				/>

				<label className="flex items-center gap-2 text-body-sm text-text-muted">
					<Checkbox
						checked={includeExpired}
						onCheckedChange={(next) => {
							setIncludeExpired(next === true);
						}}
					/>
					Show expired
				</label>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState
						icon={ShieldX}
						title="Nothing blacklisted"
						description="No entry matches. An empty blacklist is the healthy state."
					/>
				) : (
					<ul>
						{visible.map((entry) => {
							const expired = isExpired(entry);

							return (
								<li
									key={`${entry.targetType}:${entry.targetId}`}
									className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
								>
									<span className="grid size-8 shrink-0 place-items-center rounded-md bg-danger-subtle">
										<Ban className="size-4 text-danger" aria-hidden="true" />
									</span>

									<span className="min-w-0 flex-1">
										<span className="flex items-center gap-2">
											<span className="truncate text-body font-medium">{entry.name}</span>
											<Badge variant={entry.targetType === 'user' ? 'neutral' : 'info'}>
												{entry.targetType}
											</Badge>
											{expired ? <Badge variant="outline">Expired</Badge> : null}
										</span>
										<span className="block truncate font-mono text-caption text-text-muted">
											{entry.targetId}
										</span>
										{entry.reason === null ? null : (
											<span className="mt-0.5 block truncate text-body-sm text-text-muted">
												{entry.reason}
											</span>
										)}
									</span>

									<span
										className="tabular hidden w-36 shrink-0 text-right font-mono text-caption text-text-muted md:block"
										title={absoluteTime(entry.createdAt)}
									>
										{entry.expiresAt === null
											? `permanent · ${relativeTime(entry.createdAt)}`
											: `until ${dateOnly(entry.expiresAt)}`}
									</span>

									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={`Remove ${entry.name}`}
										onClick={() => {
											setRemoving(entry);
										}}
									>
										<Trash2 aria-hidden="true" />
									</Button>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<p className="mt-3 text-caption font-normal text-text-muted">
				Showing {visible.length} of {entries.length} entries.
			</p>

			<Dialog
				open={adding}
				onOpenChange={(next) => {
					if (!next) closeAdd();
					else setAdding(true);
				}}
				title="Blacklist a user or server"
				description="The block takes effect the next time a session is issued, not on the session already open."
				footer={
					<>
						<Button variant="ghost" onClick={closeAdd}>
							Cancel
						</Button>
						<Button
							variant="danger"
							disabled={!idValid}
							onClick={() => {
								toast.error('Not wired yet', {
									description: 'The API has no write path for the blacklist table.'
								});
								closeAdd();
							}}
						>
							Blacklist
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-4">
					<Field
						label="Target id"
						help="The Discord snowflake of the user or server."
						error={draftId !== '' && !idValid ? 'A snowflake is 17 to 20 digits.' : undefined}
					>
						<Input
							value={draftId}
							onChange={(event) => {
								setDraftId(event.target.value);
							}}
							placeholder="123456789012345678"
							autoComplete="off"
							inputMode="numeric"
						/>
					</Field>

					<Field label="Reason" help="Written to the audit trail. Future you will want it.">
						<Textarea
							value={draftReason}
							onChange={(event) => {
								setDraftReason(event.target.value);
							}}
							rows={3}
							placeholder="What did they do?"
						/>
					</Field>
				</div>
			</Dialog>

			<ConfirmDialog
				open={removing !== null}
				onOpenChange={(next) => {
					if (!next) setRemoving(null);
				}}
				title="Remove this block?"
				description="They get back in the moment the next session is issued."
				confirmPhrase={removing?.name ?? ''}
				confirmLabel="Remove the block"
				onConfirm={() => {
					toast.error('Not wired yet', {
						description: 'The API has no write path for the blacklist table.'
					});
					setRemoving(null);
				}}
			/>
		</div>
	);
}
