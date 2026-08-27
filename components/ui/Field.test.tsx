import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field } from './Field';
import { Input } from './Input';
import { Textarea } from './Textarea';

describe('Field', () => {
	it('wires the label to the control it wraps', () => {
		render(
			<Field label="Server name">
				<Input />
			</Field>
		);

		expect(screen.getByLabelText('Server name')).toBe(screen.getByRole('textbox'));
	});

	it('points the control at both the hint and the help text', () => {
		render(
			<Field label="Prefix" hint="One character" help="Members type this before a command">
				<Input />
			</Field>
		);

		const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby');
		expect(describedBy).toBeTruthy();

		const ids = describedBy?.split(' ') ?? [];
		expect(ids).toHaveLength(2);

		const described = ids.map((id) => document.getElementById(id)?.textContent);
		expect(described).toContain('One character');
		expect(described).toContain('Members type this before a command');
	});

	it('marks the control invalid and shows the error instead of the help text', () => {
		render(
			<Field label="Prefix" help="Members type this" error="Prefix is already taken">
				<Input />
			</Field>
		);

		expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByText('Prefix is already taken')).toBeInTheDocument();
		expect(screen.queryByText('Members type this')).not.toBeInTheDocument();
	});

	it('disables the control it wraps when the field is disabled', () => {
		render(
			<Field label="Prefix" disabled>
				<Input />
			</Field>
		);

		expect(screen.getByRole('textbox')).toBeDisabled();
	});

	it('reaches a Textarea the same way it reaches an Input', () => {
		render(
			<Field label="Welcome message" error="Too long">
				<Textarea />
			</Field>
		);

		const textarea = screen.getByLabelText('Welcome message');
		expect(textarea.tagName).toBe('TEXTAREA');
		expect(textarea).toHaveAttribute('aria-invalid', 'true');
	});

	it('leaves a bare control untouched when there is no Field around it', () => {
		render(<Input aria-label="Loose input" />);

		const input = screen.getByRole('textbox');
		expect(input).not.toHaveAttribute('aria-invalid');
		expect(input).not.toHaveAttribute('aria-describedby');
	});
});
