'use client';

import { useTranslations } from 'next-intl';
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
	const t = useTranslations('confirm');
	const shared = useTranslations('common');
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
						{shared('cancel')}
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
					label={t('type', { phrase: confirmPhrase })}
					help={matches ? undefined : t('mustMatch')}
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
