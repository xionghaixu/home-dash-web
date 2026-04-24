import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginPrettier from 'eslint-plugin-prettier/recommended'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  pluginPrettier,
  {
    files: ['src/**/*.{js,vue}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/public/**',
      'babel.config.js',
      'vite.config.js',
      '*.config.js'
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'no-console': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-empty': ['error', { allowEmptyCatch: true }]
    },
    languageOptions: {
      globals: {
        module: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        process: 'readonly'
      }
    }
  }
]
