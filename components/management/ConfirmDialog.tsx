'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmPhrase: string;
	confirmLabel: string;
	onConfirm: () => void;
	children?: ReactNode;
};

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmPhrase,
	confirmLabel,
	onConfirm,
	children
}: ConfirmDialogProps) {
	const [typed, setTyped] = useState('');
	const matches = typed.trim() === confirmPhrase;

	function close() {
		setTyped('');
		onOpenChange(false);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setTyped('');
				onOpenChange(next);
			}}
			title={title}
			description={description}
			danger
			footer={
				<>
					<Button variant="ghost" onClick={close}>
						Cancel
					</Button>
					<Button
						variant="danger"
						disabled={!matches}
						onClick={() => {
							onConfirm();
							close();
						}}
					>
						{confirmLabel}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-4">
				{children}
				<Field
					label={`Type ${confirmPhrase} to confirm`}
					help={matches ? undefined : 'It has to match exactly, capitals included.'}
				>
					<Input
						value={typed}
						onChange={(event) => {
							setTyped(event.target.value);
						}}
						placeholder={confirmPhrase}
						autoComplete="off"
					/>
				</Field>
			</div>
		</Dialog>
	);
}
