import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Only project source is linted. `opendesign` is a static design archive,
  // `.claude` holds vendored tooling, and `public` is copied verbatim.
  globalIgnores([
    'dist',
    'node_modules',
    '.claude',
    '.superpowers',
    'opendesign',
    'scripts',
    'docs',
    'public',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
