---
title: Theming Guide
---

UI components in the Gusto Embedded React SDK ship with simple baseline styles that are fully themable. "Themable" means that components are designed to take on the look and feel of the application in which they are embedded.

For a complete inventory of available variables, see [theme variables](./theme-variables.md).

> Theming is the recommended approach for customizing your UI. For advanced customization, however, where theming is insufficient to completely match your application UI, you can explore usage of [component adapters](../component-adapter/component-adapter.md) which allow you to completely supply your own components.

## Setting up styles

Before configuring theming, you must import the SDK styles:

```typescript
import '@gusto/embedded-react-sdk/style.css'
```

Developers typically apply this import at the application root where they are also setting up the `GustoProvider`.

## Theme variables

A theme is a collection of variables that determine how the SDK UI components will look. There are theme variables available for colors, typography, shadows, and more. The React SDK ships with a basic default theme as a starting point, but it is expected that developers will override theme variables to make the React SDK fit seamlessly into their application.

See [theme variables](./theme-variables.md) for a complete list of available variables.

## Setting a Theme

You can set your theme by passing variables to the `theme` prop of the `GustoProvider` component.

```
import { GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function MyApp({ children }) {
  return (
    <GustoProvider
      theme={{
        colorPrimary: 'red',
        colorPrimaryAccent: 'darkred',
        colorPrimaryContent: 'white',
        fontFamily: 'Courier New',
      }}
      config={{
        baseUrl: `/proxy-url/`,
      }}
    >
      {children}
    </GustoProvider>
  )
}
```

## Accessibility

[Having sufficient color contrast is important to ensure your UI is accessible to all users](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). To meet color contrast requirements, you must ensure sufficient contrast between each background color and its corresponding content color.

For example, consider the body color variables:

```
  colorBody
  colorBodyAccent
  colorBodyContent
  colorBodySubContent
```

The `colorBodyContent` and `colorBodySubContent` colors will be displayed on top of both `colorBody` and `colorBodyAccent` backgrounds. You must ensure sufficient color contrast between:

- `colorBody` and `colorBodyContent`/`colorBodySubContent`
- `colorBodyAccent` and `colorBodyContent`/`colorBodySubContent`

The same principle applies to primary colors (`colorPrimary`/`colorPrimaryAccent` and `colorPrimaryContent`). All color variables follow this naming pattern, and the same contrast requirements apply to each color group.
