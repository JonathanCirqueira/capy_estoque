---
name: shadcn
description: Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI, including chat interfaces. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file.
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---

# shadcn/ui

A framework for building UI, components, and design systems. Components are added as source code to the user's project via the CLI.

> **IMPORTANT:** Run CLI commands using the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` based on `packageManager`.

## Principles

1. **Use existing components first.** Use `npx shadcn@latest search` before writing custom UI.
2. **Compose, don't reinvent.** Settings = Tabs + Card + Forms. Dashboard = Sidebar + Card + Chart + Table.
3. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.
4. **Use semantic colors.** `bg-primary`, `text-muted-foreground` — never raw values like `bg-blue-500`.

## Component Standards & Rules

For detailed rules and TSX code examples, consult the dedicated rule files:

- **[Styling & Tailwind](./rules/styling.md)**: Layout with `className`, `gap-*` (no `space-x/y`), `size-*`, `truncate`, semantic tokens for light/dark, `cn()` for conditionals, no manual `z-index` on overlays.
- **[Forms & Inputs](./rules/forms.md)**: `FieldGroup` + `Field`, `InputGroup` + `InputGroupInput`/`Addon`, `ToggleGroup` for 2–5 choices, `FieldSet` + `FieldLegend`, `data-invalid`/`aria-invalid` and `data-disabled`/`disabled`.
- **[Component Composition](./rules/composition.md)**: Items inside Groups (`SelectItem` → `SelectGroup`), `asChild`/`render` for custom triggers, mandatory titles for Dialog/Sheet/Drawer, full Card structure, `Spinner` inside Button, `AvatarFallback` required, `Empty`, `Alert`, `Separator`, `Skeleton`, `Badge`.
- **[Icons](./rules/icons.md)**: Use `data-icon="inline-start/end"` in buttons, no sizing classes on icons inside components, pass icon objects.
- **[Chat & Messaging](./rules/chat.md)**: Use `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker`. No custom scroll container or raw `div` bubbles.
- **[Base UI vs Radix](./rules/base-vs-radix.md)**: Check `base` field in project info (`radix` vs `base`). Use `asChild` for Radix, `render` for Base UI.

## Component Selection Table

| Need                       | Use                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Button / Action            | `Button` with appropriate variant                                                                   |
| Form Inputs                | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| Toggle 2–5 Options         | `ToggleGroup` + `ToggleGroupItem`                                                                   |
| Data Display               | `Table`, `Card`, `Badge`, `Avatar`                                                                  |
| Navigation                 | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination`                                     |
| Overlays                   | `Dialog` (modal), `Sheet` (side panel), `Drawer` (bottom sheet), `AlertDialog`                      |
| Feedback                   | `toast` (Base UI), `sonner` (Radix), `Alert`, `Progress`, `Skeleton`, `Spinner`                     |
| Command Palette            | `Command` inside `Dialog`                                                                           |
| Charts                     | `Chart` (wraps Recharts)                                                                            |
| Layout                     | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible`                          |
| Empty States               | `Empty`                                                                                             |
| Menus                      | `DropdownMenu`, `ContextMenu`, `Menubar`                                                            |
| Tooltips / Info            | `Tooltip`, `HoverCard`, `Popover`                                                                   |
| Chat UI                    | `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker`                                      |

## Project Context Key Fields

- **`aliases`**: Use actual alias prefix (`@/`, `~/`).
- **`isRSC`**: If `true`, add `"use client"` when components use hooks or browser APIs.
- **`tailwindVersion`**: `"v4"` uses `@theme inline`; `"v3"` uses `tailwind.config.js`.
- **`tailwindCssFile`**: Global CSS file with theme variables.
- **`base`**: `radix` or `base`.
- **`iconLibrary`**: Import icons from specified library (`lucide-react`, `@tabler/icons-react`, etc.).
- **`packageManager`**: `npm`, `pnpm`, `bun`, or `yarn`.

## Workflow

1. **Check context**: Read `components.json` or run `npx shadcn@latest info`.
2. **Find & Inspect**: Use `npx shadcn@latest search` and `npx shadcn@latest docs <component>`.
3. **Install / Preview**: Use `npx shadcn@latest add <component>` (`--dry-run` or `--diff` to preview).
4. **Review & Fix**: Verify imports match project aliases and icon library.

For full CLI usage, see [cli.md](./cli.md) and [customization.md](./customization.md).
