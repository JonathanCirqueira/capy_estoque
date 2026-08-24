# Customization & Theming

Components reference semantic CSS variable tokens defined in `globals.css` (or `tailwindCssFile`).

## Color Variables

Colors follow the `name` / `name-foreground` convention (`--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--destructive`, `--background`, `--foreground`, `--card`, `--border`, `--ring`).

Colors use OKLCH format: `--primary: oklch(0.205 0 0)`.

## Adding Custom Colors

1. Define in global CSS (`globals.css`):
```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}
```

2. Register in Tailwind v4 (`@theme inline`) or Tailwind v3 (`tailwind.config.js`):
```css
/* Tailwind v4 */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

3. Use in components:
```tsx
<div className="bg-warning text-warning-foreground">Warning</div>
```

## Customizing Components

1. **Built-in variants**: `<Button variant="outline" size="sm">`
2. **Layout via className**: `<Card className="mx-auto max-w-md">`
3. **CVA Variants**: Edit component file (`components/ui/button.tsx`) to add new variants via `cva`.
4. **Wrapper Components**: Compose primitives into higher-level UI blocks.
