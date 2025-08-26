// eslint.config.js (CommonJS)
const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');

module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['node_modules', 'dist'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },

    plugins: {
      prettier,
    },

    rules: {
      ...js.configs.recommended.rules,
      'prettier/prettier': 'error', // Prettier is single source of truth
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      curly: 'error',
      camelcase: ['error', { properties: 'always' }],
      // removed semi, quotes, indent (Prettier handles them)
    },
  },
];
