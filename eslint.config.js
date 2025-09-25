import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

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
      'capacitor.config.ts',
      'scripts/**',
      'tests/**',
      'src/test/**',
      'temp/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**'
    ]
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        vi: 'readonly',
        React: 'readonly',
        $: 'readonly',
        jQuery: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-empty': 'warn',
      'no-redeclare': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',

      // Import plugin rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/no-duplicates': 'warn',
      'import/no-unused-modules': 'warn',

      // Limpieza de imports/variables no usados
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        vi: 'readonly',
        React: 'readonly'
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
      'unused-imports': unusedImports,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json'
        }
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Apagamos los genéricos y usamos unused-imports
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',

      // Mantienes otras reglas como las tenías
      'no-undef': 'off',
      'no-empty': 'off',
      'no-redeclare': 'off',
      'prefer-const': 'off',
      'no-var': 'off',
      'no-unreachable': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',

      // Import plugin rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/no-duplicates': 'warn',
      'import/no-unused-modules': 'warn',

      // 🚀 Detectar imports y variables no usados símbolo por símbolo
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }
      ],
    },
  }
]
