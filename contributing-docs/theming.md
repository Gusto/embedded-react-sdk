# RFC: Theming System Design for Design System SDK

> Note: once an approach is approved, this document will be updated to document the consensus approach with more detailed guidelines.

## Background

As we have scaled, it's become apparent that our current theming approach has some areas for improvement. The biggest thing is getting alignment with design and creating an approach that is consistent and predictable for engineers and easy to use for partners.

## Should we even do this? A foundational theming question in an adapter world

Since we've introduced adapters, there have been even more questions around the role of theming in the SDK. Consumers can now supply their own React components which allows exact consistency with UI in the rest of their application.

There is a preliminary question here on if theming is even necessary in a world with adapters given anything that can be done with theming can be done more completely with component adapters. Based on prior team discussions, we considered the following:

- Setting up adapters is more technically involved
- Adapters represent visual updates on a component by component basis, it's harder to impact UI globally (vs. setting a single color variable that cascades everywhere)
- We have some signal that partners with more bias towards speed to launch may be less particular and may prefer a lighter touch solution

This document will assume we are moving forward with a theming approach even in a world with component adapters, but this can still be an open topic of conversation as a foundational concern.

## Challenge with the Current Theming Approach

- Inconsistent naming conventions (camelCase vs. kebab-case)
- Inconsistent use of abbreviations (`bg`, `fg`, `tx`, etc.)
- Inconsistent use of component variants in naming as well as inconsistencies in the CSS state
- Difficult to know which theme variables a component should support

Example inconsistencies: `checkbox-selectedColor` vs `checkbox-hover-checkedBackground` vs. `input-hovered-borderColor`

## What We Want in a Solution

- A consistent and predictable naming convention
- Alignment between design tokens in Figma and code
- Clear rules around what should be themed
- Simple usage for partners

---

## Proposed Approaches

### 1. Global-Only Theming

This approach restricts theming to a set of high-level, global tokens:

- Colors (e.g. `--color-gray-100`)
- Typography (e.g. `--font-size-regular`, `--font-weight-medium`)
- Radius, spacing, shadows, etc.

These variables are used by components internally but are not structured by component or interaction state.

#### Example

```ts
const theme = {
  colors: {
    gray: {
      100: '#FFFFFF',
      1000: '#1C1C1C',
    },
    success: {
      500: '#0A8080',
    },
  },
  fontSize: {
    regular: '16px',
    small: '14px',
  },
}
```

CSS output:

```css
:root {
  --color-gray-100: #ffffff;
  --font-size-regular: 16px;
}
```

Variables used in a component:

```css
.button {
  background-color: var(--color-gray-1000);
  font-size: var(--font-size-regular);
}
```

#### Pros

- Easier to maintain and reason about
- Smaller API surface
- Good for simple themes or lighter branding control
- High global impact with minimal configuration

#### Cons

- Less flexibility at the individual component level, no theming escape hatch for overrides
- Difficult to support interactive or variant-based styling (e.g. hover, pressed)
- Challenging to scale according to partner needs without introducing component level variables

### 2. Structured Component-Level Theming

This approach defines theme tokens at the component level, optionally scoped by variant and CSS state. Naming follows a standardized structure:

```css
[component](-[variant])?(-[css-state])?-[css-property]
Tokens are stored in a deeply nested object and compiled to CSS custom properties.
```

```ts
const theme = {
  button: {
    primary: {
      background-color: '#1C1C1C',
      hover: {
        background-color: '#6C6C72',
      },
    },
    secondary: {
      background-color: '#FFFFFF',
    },
  },
}
```

CSS output:

```css
:root {
  --button-primary-background-color: #1c1c1c;
  --button-primary-hover-background-color: #6c6c72;
  --button-secondary-background-color: #ffffff;
}
```

Usage within a component

```css
.button--primary:hover {
  background-color: var(--button-primary-hover-background-color);
}
```

#### Pros

- Clear, predictable structure for every component
- Tokens are directly linked to component APIs and design specs
- Easy to scale to variants, states, and specific overrides

#### Cons

- Higher overhead to define and maintain
- Larger token surface area
- Slightly more complex theme authoring experience

#### Open Design Consideration around global variables

One option for simplification with this approach would be forgoing exposing the global variable set. Ex. currently we have things like `colors` exposed (`--color-gray-100`) in addition to the component level themes like `--button-primary-background-color`. We could just opt to have the component level variables with a very limited set of global items (for things like font).

## Recommendation

My recommendation is using option 2. At a minimum, option 1 would likely need to be modified to expose at least some component level variables. But working with design, we started with an option 1 approach and realized a system that didn't expose at least some variables for component level states (especially around interactive components, button/input) would likely not be viable for a partner. Global cascades are highly opinionated about our mapping and would make it challenging for a partner to get something resembling their own brand without being able to modify at the component level.
