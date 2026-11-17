// @ts-check

import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginAstro from 'eslint-plugin-astro'
import eslintPluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['dist/**', '.astro/**', 'convex/_generated/**', 'node_modules/**']),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.vue'],
    extends: [eslintPluginVue.configs['flat/recommended']],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    // shadcn-vue generated primitives use single-word names and optional class props
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
)
