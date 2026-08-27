'use client';

import { createContext, useContext } from 'react';

export type FieldState = {
	controlId: string;
	describedBy: string | undefined;
	invalid: boolean;
	disabled: boolean;
};

const FieldContext = createContext<FieldState | undefined>(undefined);

export const FieldProvider = FieldContext.Provider;

export function useFieldState(): FieldState | undefined {
	return useContext(FieldContext);
}
