---
title: Theme Variables
sidebar_position: 8
---

The SDK exposes theme variables to customize colors, typography, spacing, and other visual properties. Pass a partial theme object to `GustoProvider` — you only need to specify the variables you want to change.

## Usage

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      theme={{
        colorPrimary: '#007bff',
        fontFamily: '"Inter", sans-serif',
        fontSizeRegular: '16px',
        inputRadius: '8px',
        buttonRadius: '8px',
      }}
    >
      {/* Your app content */}
    </GustoProvider>
  )
}
```

:::note Accessibility
When customizing colors, ensure sufficient contrast ratios between foreground and background colors to meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).
:::

## Variable Reference

### Colors

| Variable | Type |
| --- | --- |
| **colorBody** | `string` |
| **colorBodyAccent** | `string` |
| **colorBodyContent** | `string` |
| **colorBodySubContent** | `string` |
| **colorBorder** | `string` |
| **colorError** | `string` |
| **colorErrorAccent** | `string` |
| **colorErrorContent** | `string` |
| **colorInfo** | `string` |
| **colorInfoAccent** | `string` |
| **colorInfoContent** | `string` |
| **colorPrimary** | `string` |
| **colorPrimaryAccent** | `string` |
| **colorPrimaryContent** | `string` |
| **colorSecondary** | `string` |
| **colorSecondaryAccent** | `string` |
| **colorSecondaryContent** | `string` |
| **colorSuccess** | `string` |
| **colorSuccessAccent** | `string` |
| **colorSuccessContent** | `string` |
| **colorWarning** | `string` |
| **colorWarningAccent** | `string` |
| **colorWarningContent** | `string` |

### Typography

| Variable | Type |
| --- | --- |
| **fontFamily** | `string` |
| **fontLineHeightRegular** | `string` |
| **fontSizeHeading1** | `string` |
| **fontSizeHeading2** | `string` |
| **fontSizeHeading3** | `string` |
| **fontSizeHeading4** | `string` |
| **fontSizeHeading5** | `string` |
| **fontSizeHeading6** | `string` |
| **fontSizeLarge** | `string` |
| **fontSizeRegular** | `string` |
| **fontSizeRoot** | `string` |
| **fontSizeSmall** | `string` |
| **fontWeightBold** | `string` |
| **fontWeightMedium** | `string` |
| **fontWeightRegular** | `string` |
| **fontWeightSemibold** | `string` |

### Focus and Shadows

| Variable | Type |
| --- | --- |
| **focusRingColor** | `string` |
| **focusRingWidth** | `string` |
| **shadowResting** | `string` |
| **shadowTopmost** | `string` |

### Component-Specific

| Variable | Type |
| --- | --- |
| **badgeRadius** | `string` |
| **buttonRadius** | `string` |
| **inputAdornmentColor** | `string` |
| **inputBackgroundColor** | `string` |
| **inputBorderColor** | `string` |
| **inputBorderWidth** | `string` |
| **inputContentColor** | `string` |
| **inputDescriptionColor** | `string` |
| **inputDisabledBackgroundColor** | `string` |
| **inputErrorColor** | `string` |
| **inputLabelColor** | `string` |
| **inputLabelFontSize** | `string` |
| **inputLabelFontWeight** | `string` |
| **inputPlaceholderColor** | `string` |
| **inputRadius** | `string` |
| **transitionDuration** | `string` |
