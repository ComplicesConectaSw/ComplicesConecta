import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'android/**',
      '.vscode/**',
      'public/**',
      'supabase/functions/**',
      '*.config.js',
      '*.config.ts',
      'capacitor.config.ts'
    ]
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off',
      'no-unused-expressions': 'off'
    },
  },
  {
    files: ['**/*.config.{ts,js}', 'capacitor.config.ts', 'vite.config.ts', 'tailwind.config.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
]
