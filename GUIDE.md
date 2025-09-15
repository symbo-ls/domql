### DomQL schema guide: allowed syntax and common pitfalls

Use this as a quick reference for writing domql schemas safely and predictably.

## Allowed/expected structure
- **Top-level keys**
  - Allowed: `style`, `class`, `text`, `html`, `content`, `data`, `attr`, `state`, `scope`, `props`, `define`, `on`, `extend`, `extends`, `childExtend`, `childExtends`, `childProps`, `children`, `component`, `context`, `tag`, `key`
  - Component children: any key starting with a capital letter (e.g., `Header`, `Img`) creates a child element.

- **Styles**
  - Prefer `style` object for CSS:
```js
{
  style: {
    display: 'flex',
    gap: 'A',
    borderRadius: '8px'
  }
}
```

- **Events**
  - Put handlers under `on` or `props.onX` and ensure values are functions:
```js
{
  on: {
    click: (e, el, s, ctx) => { /* ... */ },
    render: (el, s, ctx) => { /* ... */ }
  }
}
```

- **Text and interpolation**
  - Use `text` for textual content; `{{ var }}` placeholders are supported:
```js
{ text: 'Hello {{ name }}' }
```

- **Children**
  - Use `children: []` or a pure function returning children:
```js
{ children: [{ Header: { /* ... */ }}, { Body: { /* ... */ }}] }
```

- **Components and extends**
  - `extend`/`extends` accept a component or array of components:
```js
{ extend: 'Button', props: { size: 'lg' } }
```

- **Variants (class-like blocks)**
  - Define variant blocks with keys starting with `.` (e.g., `.primary`).
  - To apply a variant, set `props.variant` to the variant name (without the dot):
```js
{
  '.primary': { style: { background: 'blue', color: '#fff' } },
  props: { variant: 'primary' }
}
```

## Invalid or discouraged patterns (what validator flags)
- **Unknown top-level keys**
  - Warning: unknown key at root (likely a typo or CSS prop in the wrong place).

- **CSS properties at top-level (outside `style`)**
  - Warning: likely CSS property at top-level; move into `style`.
```js
// Not recommended (will warn and be ignored by runtime):
{ display: 'flex', gap: 'A' }
// Do this instead:
{ style: { display: 'flex', gap: 'A' } }
```

- **Pseudo selectors as element keys**
  - Error: keys like `:hover`, `::before` are not supported as element keys.
  - Use variants or a CSS/styling plugin to generate pseudo rules from classes.

- **Self-extend**
  - Error: component cannot `extend` itself.

- **Events must be functions**
  - Error: `on.click: 123` is invalid; supply a function.

- **Risky lifecycle updates**
  - Warning: `on.render`, `on.beforeUpdate`, `on.update` that call `state.update`, `state.replace` or `.update(` may cause loops.
  - Specific warning: `on.stateUpdate` that calls update/replace is high-risk.

- **Children type and keys**
  - Warning: `children` must be an array or a function.
  - Warning: children array should have stable `key`s and no duplicates.

- **Props side-effects**
  - Warning: function values inside `props` that call `update`/`replace` may cause loops.

## Pseudo and advanced styling
- Pseudo selectors (`:hover`, `::before`) and nested pseudo targets inside variant blocks are not interpreted by domql; they are reported and ignored.
- Recommended approaches:
  - Use variants (`.primary`, `.active`) and toggle via `props.variant`.
  - Use a CSS-in-JS plugin or stylesheet to define pseudo rules for a class that domql assigns, then set that class via `class`.

## Examples

- Valid: element with style, events, and variant
```js
{
  style: { display: 'flex', alignItems: 'center' },
  on: {
    click: (e, el, s) => { /* ... */ }
  },
  '.success': { style: { backgroundColor: '#10b981' } },
  props: { variant: 'success' }
}
```

- Invalid: pseudo selector as key (error)
```js
{
  ':hover': { style: { backgroundColor: '#333' } } // Unsupported
}
```

- Invalid: top-level CSS props (warn + ignored)
```js
{
  display: 'flex', // Move to style.display
  gap: 'A'
}
```

- Valid: text with interpolation
```js
{
  FileName: { text: '{{ fileName }}', style: { fontWeight: 'bold' } }
}
```

## Event handler guidance
- Allowed and preferred:
  - `on.click`, `on.render`, `on.startUpdate`, `on.beforeUpdate`, `on.update`, `on.stateUpdate`, etc., with function values.
- Avoid:
  - Calling `update`/`replace` in `on.render`, `on.update`, `on.beforeUpdate` unless guarded by checks to prevent loops.
  - Calling `update`/`replace` inside `on.stateUpdate` without change detection guards.

## Common runtime messages you may see
- **UnsupportedPseudoSelector**: A key beginning with `:` was found; it’s ignored.
- **css-prop-top-level**: A CSS-like key was found at the root; move it under `style`.
- **on-function**: An `on.*` handler was not a function.
- **self-extend**: A component attempted to extend itself.
- **loop-risk-…**: A lifecycle handler contains update/replace calls; add guards.

## Quick checklist for authors
- Put CSS under `style`.
- Use capitalized keys for child elements/components.
- Use `.variant` blocks and select via `props.variant`.
- Use `on.*` with functions only; avoid unguarded `update`/`replace` in lifecycles.
- Give children stable keys if using an array.
- Don’t use `:hover`/`::before` as keys; handle with variants or CSS plugin.
