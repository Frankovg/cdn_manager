# Commands

- Locales are regenerated from the source YAML files with the command `make locales` to update the TypeScript files.

# Code Style

- Use `!foo.length` instead of `foo.length === 0`. Shorten boolean checks to `if (foo)` when checking for foo not being empty, null or undefined.
- Never use array syntax for Vue `:class`, always prefer object syntax instead.
- Vue single-file components must order their top-level blocks as `<template>`, then `<script>` or `<script setup>`, then `<style>` when present.

# Authentication

- Every page and route in the Vue application must require a valid authenticated Clerk session. Do not expose public pages, including the root route, fallback routes, error pages, or newly added routes.
- Enforce authentication with Vue Router guards and verify the session before mounting or rendering page content, including direct navigation to a URL and while Clerk is still loading.
