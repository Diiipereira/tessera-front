import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
	it('falls back to initials when there is no picture', () => {
		render(<Avatar initials="CJ" color="#8b5cf6" />);

		expect(screen.getByText('CJ')).toBeInTheDocument();
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	it('shows the picture when one is given, and drops the initials', () => {
		render(
			<Avatar
				initials="CJ"
				color="#8b5cf6"
				src="https://cdn.discordapp.com/avatars/1/abc.png?size=64"
			/>
		);

		expect(screen.queryByText('CJ')).not.toBeInTheDocument();
		expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument();
	});

	it('treats an empty string as no picture, which is what a blank hash produces', () => {
		render(<Avatar initials="CJ" color="#8b5cf6" src="" />);

		expect(screen.getByText('CJ')).toBeInTheDocument();
	});

	it('treats null as no picture', () => {
		render(<Avatar initials="CJ" color="#8b5cf6" src={null} />);

		expect(screen.getByText('CJ')).toBeInTheDocument();
	});
});
