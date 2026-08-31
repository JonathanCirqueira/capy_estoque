<laravel-boost-guidelines>
# Laravel Boost Guidelines

## Stack & Environment

- **PHP 8.3** | **Laravel 13** | **Inertia.js v3** | **React 19** | **Tailwind CSS v4** | **Pest v4** | **Fortify v1** | **Wayfinder v0** | **Pint v1**

## Foundational Rules

- **Skills Activation**: Activate domain skills (`**/skills/**`) whenever working in their domain (e.g., `inertia-react-development`, `fortify-development`, `wayfinder-development`, `pest-testing`, `laravel-best-practices`).
- **Conventions**: Follow existing codebase structure, naming, and patterns. Use descriptive variable/method names (e.g., `isRegisteredForDiscounts`).
- **Architecture**: Stick to existing directory structure; do not add base folders or change dependencies without approval.
- **Replies**: Be concise, focusing on essential rationale and actionable code rather than explaining obvious details.

## Boost MCP & Artisan Tools

- **Boost Tools**: Prefer Boost MCP tools (`database-query`, `database-schema`, `get-absolute-url`, `browser-logs`) over raw shell commands or tinker.
- **Search Docs**: Use `search-docs` before making code changes with broad topic queries (e.g., `['routing rate limiting']`).
- **Artisan**: Run commands with `--no-interaction`. Filter routes with `php artisan route:list`. Check config with `php artisan config:show app.name`.
- **Tinker**: Execute in app context with single quotes: `php artisan tinker --execute 'User::count();'`

## PHP & Laravel Conventions

- Control structures must always use curly braces `{}`.
- Use PHP 8 constructor property promotion: `public function __construct(public Service $service) {}`.
- Require explicit return type declarations and type hints on all methods.
- Enums use TitleCase keys (`FavoritePerson`). Use PHPDoc blocks with array shape type definitions.
- Model creation: Always create factories and seeders alongside models (`php artisan make:model -mfs`).
- APIs & Routes: Default to Eloquent API Resources and named routes using `route()`.

## Inertia.js v3 + React

- Components live in `resources/js/pages`. Use `Inertia::render()` for server routing instead of Blade views.
- Inertia v3 Features: Use `useHttp` hook, optimistic updates, `useLayoutProps`, instant visits, and `@inertiajs/vite` plugin.
- Deferred props: Always include pulsing/animated skeleton loading states.
- Axios is removed -> use built-in XHR client or `useHttp`. Use `Inertia::optional()` instead of `LazyProp`.
- Router: Use `router.cancelAll()` instead of `router.cancel()`.

## Wayfinder & Routing

- Use Wayfinder to generate typed TypeScript functions for Laravel routes/controllers. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

## Code Formatter & Testing Rules

- **Pint**: Run `vendor/bin/pint --dirty --format agent` after editing any PHP file.
- **Pest**: Create tests using `php artisan make:test --pest {Name}`. Run tests with `php artisan test --compact`. Every change must be programmatically verified.
  </laravel-boost-guidelines>
