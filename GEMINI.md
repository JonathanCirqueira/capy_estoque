# Project Guidelines (Gemini / Antigravity)

> **Stack**: Laravel 13 (PHP 8.3) + Inertia.js v3 + React 19 + Tailwind CSS v4 + Pest v4.
> **Architecture**: Follow rules in `AGENTS.md` and `.agents/rules/GEMINI.md`.

## Core Project Guidelines

1. **Laravel Boost & Backend**: Refer to `AGENTS.md` for full Boost guidelines, MCP tools, and backend conventions.
2. **Frontend Stack**: Inertia.js v3 + React 19 + Tailwind CSS v4. Always use Wayfinder (`@/actions` / `@/routes`) for typed route functions.
3. **Agent & Skill System**: Before implementing features, consult `MEMORY.md` and `CONTEXT.md`, follow agent routing in `.agents/rules/GEMINI.md` and load relevant skills from `.agents/skills/`.
4. **Code Quality & Testing**: Format PHP with `vendor/bin/pint --dirty --format agent`, test with `php artisan test --compact` and always run `composer verify`.
