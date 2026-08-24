# shadcn CLI Reference

Always use the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest`.

## Core Commands

### `init` — Initialize or Create Project
```bash
npx shadcn@latest init [components...] [options]
```
- `--preset <name/code>`: Apply preset configuration.
- `--template <template>`: Template (`next`, `vite`, `react-router`, `start`, `astro`).
- `--defaults`: Use defaults (`--template=next --preset=base-nova`).
- `--monorepo`: Scaffold monorepo project.

### `add` — Add Components
```bash
npx shadcn@latest add [components...] [options]
```
- `--dry-run`: Preview changes without writing files.
- `--diff [path]`: Show diffs before applying changes.
- `--view [path]`: Show file contents before adding.
- `--overwrite`: Overwrite existing files (requires user approval).
- Accepts component names (`button`), registry-prefixed (`@magicui/shimmer-button`), or GitHub addresses (`owner/repo/item`).

### `search` — Search Registries
```bash
npx shadcn@latest search [@registry] -q "keyword"
```

### `docs` — Get Component Documentation
```bash
npx shadcn@latest docs button dialog select
```
Returns documentation and example URLs for the specified components.

### `info` — Get Project Information
```bash
npx shadcn@latest info --json
```
Inspects project configuration, aliases, installed components, base primitives, and icon libraries.

### `apply` — Apply Theme Preset
```bash
npx shadcn@latest apply <code> [--only theme|font]
```
Applies preset configuration to an existing project.
