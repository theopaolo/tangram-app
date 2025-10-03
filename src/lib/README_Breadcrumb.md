# Breadcrumb Component

A reusable breadcrumb navigation component for the Tangram app.

## Usage

```svelte
<script>
  import Breadcrumb from '$lib/Breadcrumb.svelte';

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Le Chromogram', current: true },
    { label: 'Les Tangrams', disabled: true }
  ];
</script>

<Breadcrumb items={breadcrumbItems} />
```

## Props

### `items: BreadcrumbItem[]`

An array of breadcrumb items to display.

#### BreadcrumbItem Properties

- **`label`** (string) - The text to display for this breadcrumb item
- **`href`** (string, optional) - If provided, makes the item clickable and navigable
- **`current`** (boolean, optional) - If true, applies the "current" styling (underlined)
- **`disabled`** (boolean, optional) - If true, applies disabled styling (low opacity)

## Examples

### Basic breadcrumb with links
```javascript
const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Category', current: true }
];
```

### Breadcrumb with disabled items
```javascript
const items = [
  { label: 'Step 1', href: '/step1' },
  { label: 'Step 2', current: true },
  { label: 'Step 3', disabled: true },
  { label: 'Step 4', disabled: true }
];
```

### Simple breadcrumb without links
```javascript
const items = [
  { label: 'Section A' },
  { label: 'Section B', current: true },
  { label: 'Section C' }
];
```

## Styling

The component uses the following CSS classes from the app's global styles:

- `.bread` - Main container styling (fixed positioning, font size, letter spacing)
- `.current` - Applied to items with `current: true` (underlined)
- `.desactivate` - Applied to items with `disabled: true` (low opacity)

The component automatically positions itself at the bottom-left of the screen using fixed positioning.

## Features

- **Responsive**: Automatically handles different screen sizes
- **Accessible**: Proper semantic markup for navigation
- **Flexible**: Supports both linked and non-linked items
- **Consistent**: Uses the app's existing design system and styles
- **TypeScript**: Fully typed with JSDoc annotations

