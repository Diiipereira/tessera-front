import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import i18next from 'eslint-plugin-i18next';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import ts from 'typescript-eslint';

const DIRECTIVE = /^(eslint\b|eslint-|globals?\b|exported\b|@ts-|prettier-ignore\b|#)/;

const HEX = /#[0-9a-fA-F]{3,8}/;

const COPY_ATTRIBUTES = [
	'alt',
	'aria-label',
	'blurb',
	'body',
	'confirmLabel',
	'confirmPhrase',
	'description',
	'emptyLabel',
	'error',
	'help',
	'hint',
	'label',
	'lead',
	'overline',
	'placeholder',
	'searchPlaceholder',
	'summary',
	'text',
	'title'
];

const TRANSLATED = ['app/layout.tsx', 'components/account/**/*.tsx', 'components/layout/**/*.tsx'];

const house = {
	rules: {
		'no-raw-color': {
			meta: {
				type: 'problem',
				schema: [],
				messages: {
					found:
						'No colour literals in components. Use a design token, or put the value in a lib module if it belongs to Discord rather than to us.'
				}
			},
			create(context) {
				const report = (node, value) => {
					if (typeof value !== 'string' || !HEX.test(value)) return;
					context.report({ node, messageId: 'found' });
				};
				return {
					Literal(node) {
						report(node, node.value);
					},
					TemplateElement(node) {
						report(node, node.value.raw);
					}
				};
			}
		},
		'no-comments': {
			meta: {
				type: 'problem',
				schema: [],
				messages: {
					found:
						'No comments. If the code cannot say it, it belongs in CLAUDE.md under "What the code cannot say for itself".'
				}
			},
			create(context) {
				return {
					Program() {
						for (const comment of context.sourceCode.getAllComments()) {
							if (DIRECTIVE.test(comment.value.trim())) continue;
							context.report({ loc: comment.loc, messageId: 'found' });
						}
					}
				};
			}
		}
	}
};

export default ts.config(
	{ ignores: ['.next/', 'node_modules/', 'next-env.d.ts', 'coverage/'] },
	js.configs.recommended,
	...ts.configs.strictTypeChecked,
	...nextVitals,
	reactRefresh.configs.next,
	{
		files: ['**/*.{ts,tsx,js,mjs,cjs}'],
		plugins: { house },
		rules: { 'house/no-comments': 'error' }
	},
	{
		files: ['**/*.tsx'],
		ignores: ['**/*.test.tsx'],
		rules: { 'house/no-raw-color': 'error' }
	},
	{
		files: ['**/*.{ts,tsx}'],
		plugins: { 'better-tailwindcss': betterTailwind },
		settings: {
			'better-tailwindcss': {
				entryPoint: 'app/globals.css',
				tsconfig: 'tsconfig.json'
			}
		},
		rules: {
			'better-tailwindcss/no-deprecated-classes': 'error',
			'better-tailwindcss/enforce-canonical-classes': 'error'
		}
	},
	{
		files: ['components/modules/DiscordPreview.tsx'],
		rules: { '@next/next/no-img-element': 'off' }
	},
	{
		files: TRANSLATED,
		ignores: ['**/*.test.{ts,tsx}'],
		plugins: { i18next },
		rules: {
			'i18next/no-literal-string': [
				'error',
				{
					mode: 'jsx-only',
					'jsx-attributes': { include: COPY_ATTRIBUTES }
				}
			]
		}
	},
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: ts.parser,
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' }
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	},
	{
		files: ['**/*.{js,mjs,cjs}'],
		extends: [ts.configs.disableTypeChecked]
	},
	prettier
);
