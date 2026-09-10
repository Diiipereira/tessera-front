import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocsCompare } from './DocsCompare';
import { DocsFacts } from './DocsFacts';
import { DocsFlow } from './DocsFlow';

describe('DocsFlow', () => {
	it('numbers the steps so a reader can point at one', () => {
		render(<DocsFlow steps={[{ title: 'Entrada' }, { title: 'Cargos' }, { title: 'Mensagem' }]} />);

		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getAllByRole('listitem')).toHaveLength(3);
	});

	it('carries the note of a step when it has one, and nothing when it does not', () => {
		render(
			<DocsFlow steps={[{ title: 'Entrada', note: 'O Discord avisa' }, { title: 'Cargos' }]} />
		);

		expect(screen.getByText('O Discord avisa')).toBeInTheDocument();
	});

	it('shows the caption under the diagram', () => {
		render(<DocsFlow steps={[{ title: 'Um' }]} caption="a ordem importa" />);

		expect(screen.getByText('a ordem importa')).toBeInTheDocument();
	});
});

describe('DocsFacts', () => {
	it('pairs every label with its value', () => {
		render(
			<DocsFacts
				items={[
					{ label: 'Dispara em', value: 'Um membro entra' },
					{ label: 'Precisa de', value: 'Enviar Mensagens' }
				]}
			/>
		);

		expect(screen.getByText('Dispara em')).toBeInTheDocument();
		expect(screen.getByText('Enviar Mensagens')).toBeInTheDocument();
	});
});

describe('DocsCompare', () => {
	it('keeps the two columns apart, each with its own title', () => {
		render(
			<DocsCompare
				yesTitle="O teste faz"
				noTitle="O teste não faz"
				yes={['Publica no canal']}
				no={['Entrega cargos']}
			/>
		);

		expect(screen.getByText('O teste faz')).toBeInTheDocument();
		expect(screen.getByText('Entrega cargos')).toBeInTheDocument();
		expect(screen.getAllByRole('list')).toHaveLength(2);
	});
});
