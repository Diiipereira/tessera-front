'use client';

import { TriangleAlert } from 'lucide-react';
import { useId, useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { FieldProvider, type FieldState } from './field-context';

type FieldProps = {
	label?: string;
	hint?: string;
	help?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
};

export function Field({
	label,
	hint,
	help,
	error,
	required = false,
	disabled = false,
	className,
	children
}: FieldProps) {
	const uid = useId();
	const controlId = `${uid}-control`;
	const hintId = `${uid}-hint`;
	const messageId = `${uid}-message`;

	const invalid = error !== undefined && error !== '';
	const message = invalid ? error : help;

	const describedBy =
		[hint ? hintId : undefined, message ? messageId : undefined].filter(Boolean).join(' ') ||
		undefined;

	const state = useMemo<FieldState>(
		() => ({ controlId, describedBy, invalid, disabled }),
		[controlId, describedBy, invalid, disabled]
	);

	return (
		<div className={cn('flex flex-col', className)}>
			{label ? (
				<label
					htmlFor={controlId}
					className={cn(
						'text-body-sm font-medium',
						disabled ? 'text-text-subtle' : 'text-text',
						hint ? 'mb-0.5' : 'mb-1.5'
					)}
				>
					{label}
					{required ? (
						<span className="text-danger" aria-hidden="true">
							*
						</span>
					) : null}
				</label>
			) : null}

			{hint ? (
				<p id={hintId} className="mb-1.5 text-caption font-normal text-text-muted">
					{hint}
				</p>
			) : null}

			<FieldProvider value={state}>{children}</FieldProvider>

			{message ? (
				<div
					id={messageId}
					className={cn(
						'mt-1.5 flex items-center gap-1.5 text-caption font-normal',
						invalid ? 'text-danger' : 'text-text-muted'
					)}
				>
					{invalid ? <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" /> : null}
					<span>{message}</span>
				</div>
			) : null}
		</div>
	);
}
