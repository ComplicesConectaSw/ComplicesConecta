import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

export default [
  // Ignores globales (deben estar primero)
  {
    ignores: [
      // Directorios completos generados
      'dist/**',
      'build/**',
      'node_modules/**',
      'android/**',
      'android/app/**',
      '.vscode/**',
      'supabase/functions/**',
      'scripts/**',
      'tests/**',
      'src/test/**',
      'temp/**',
      'coverage/**',
      'playwright-report/**',
      'playwright-report-e2e/**',
      'test-results/**',
      'respaldo_auditoria/**',
      'backups/**',
      'reports/**',
      // Archivos específicos
      '*.config.js',
      '*.config.ts',
      'capacitor.config.ts',
      '**/*.bak',
      '**/BACKUP_*',
      '**/*.ps1',
      '**/*.min.js',
      '**/*.bundle.js',
      // Archivos generados específicos
      'dist/**/*.js',
      'dist/**/*.mjs',
      'android/**/*.js',
      'android/**/*.mjs',
      // Vendor files generados
      '**/vendor*.js',
      '**/vendor*.mjs',
      // Archivos en public que son generados (excepto sw.js y sw-notifications.js que son código fuente)
      'public/assets/**',
      'public/models/**',
      'public/app-release.apk',
      // Archivos específicos generados
      '**/native-bridge.js',
      '**/*-UMueESM8.js',
      '**/*-cofmjEzh.js',
      '**/*-BHieyP4h.js',
      '**/*-B1Cv6Wjs.js',
      // Archivos de tipos generados de Supabase
      'src/types/supabase-generated.ts',
      'src/types/supabase.ts',
      // Archivos de test
      '**/*.test.ts',
      '**/*.spec.ts'
    ]
  },
  // Configuración para archivos JS/JSX
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
      'import/no-unresolved': ['error', {
        ignore: ['neo4j-driver'],
        caseSensitive: true
      }],
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
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
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
      'import/no-unresolved': ['error', {
        ignore: ['neo4j-driver'],
        caseSensitive: true
      }],
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
