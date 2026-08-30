import type { CSSProperties } from 'react';

const INK = '#e6e6ea';
const GROUND = '#0b0b0f';
const MUTED = '#a2a2ad';
const SUBTLE = '#6f6f7b';
const RAISED = '#1a1a22';
const EDGE = '#33333d';

export const globalErrorStyles = {
	body: {
		margin: 0,
		minHeight: '100vh',
		display: 'grid',
		placeItems: 'center',
		fontFamily: 'system-ui, sans-serif',
		background: GROUND,
		color: INK
	},
	main: { maxWidth: '32rem', padding: '2rem', textAlign: 'center' },
	heading: { fontSize: '1.25rem', margin: 0 },
	body_text: { marginTop: '0.75rem', lineHeight: 1.6, color: MUTED },
	digest: {
		marginTop: '0.75rem',
		fontFamily: 'ui-monospace, monospace',
		color: SUBTLE
	},
	button: {
		marginTop: '1.5rem',
		padding: '0.5rem 1rem',
		borderRadius: '0.5rem',
		border: `1px solid ${EDGE}`,
		background: RAISED,
		color: 'inherit',
		font: 'inherit',
		cursor: 'pointer'
	}
} satisfies Record<string, CSSProperties>;
