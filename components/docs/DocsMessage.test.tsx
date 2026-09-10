import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocsMessage } from './DocsMessage';

describe('DocsMessage', () => {
	it('draws the bot badge, because that is what a reader sees in Discord', () => {
		render(<DocsMessage author="Tessera" content="hello" />);

		expect(screen.getByText('BOT')).toBeInTheDocument();
		expect(screen.getByText('Tessera')).toBeInTheDocument();
	});

	it('leaves the badge out for a message drawn as a person', () => {
		render(<DocsMessage author="Lia" bot={false} content="hello" />);

		expect(screen.queryByText('BOT')).not.toBeInTheDocument();
	});

	it('highlights every mention, not only the first', () => {
		render(<DocsMessage content="@lia and @rui, see #rules and #help" />);

		for (const token of ['@lia', '@rui', '#rules', '#help']) {
			expect(screen.getByText(token)).toBeInTheDocument();
		}
	});

	it('keeps highlighting mentions across separate messages', () => {
		render(
			<>
				<DocsMessage content="@one" />
				<DocsMessage content="@two" />
			</>
		);

		expect(screen.getByText('@one')).toBeInTheDocument();
		expect(screen.getByText('@two')).toBeInTheDocument();
	});

	it('draws every part of an embed that was given', () => {
		render(
			<DocsMessage
				embed={{
					color: '#5865f2',
					author: 'Autor',
					title: 'Regras',
					description: 'Leia antes de falar.',
					fields: [{ name: 'Dúvidas', value: '#suporte', inline: true }],
					footer: 'Servidor de Testes'
				}}
			/>
		);

		for (const text of [
			'Autor',
			'Regras',
			'Leia antes de falar.',
			'Dúvidas',
			'Servidor de Testes'
		]) {
			expect(screen.getByText(text)).toBeInTheDocument();
		}
	});

	it('draws buttons and reactions when the example carries them', () => {
		render(
			<DocsMessage
				content="hello"
				buttons={[{ label: 'Entrar', style: 'primary' }]}
				reactions={[{ emoji: '🎉', count: 12 }]}
			/>
		);

		expect(screen.getByText('Entrar')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
	});

	it('says nothing extra when only a caption was given', () => {
		render(<DocsMessage content="hello" caption="o que sai no canal" />);

		expect(screen.getByText('o que sai no canal')).toBeInTheDocument();
	});
});
