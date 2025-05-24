module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended', 'plugin:prettier/recommended'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
        project: './tsconfig.test.json',
    },
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        'linebreak-style': ['error', 'unix'],
        'require-await': 'error',
        'no-warning-comments': [1, { terms: ['todo', 'fixme', 'fix'], location: 'start' }],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '(^_|^this$)' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-restricted-syntax': [
            'warn',
            {
                selector: "VariableDeclaration[kind = 'let'] > VariableDeclarator[init = null]:not([id.typeAnnotation])",
                message: 'Type must be inferred at variable declaration',
            },
        ],
        '@typescript-eslint/await-thenable': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unnecessary-condition': 'warn',
    },
};
