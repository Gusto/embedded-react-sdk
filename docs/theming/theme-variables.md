# Theme Variables

| Variable                         | Type     |
| -------------------------------- | -------- |
| **colorBody**                    | `string` |
| **colorBodyAccent**              | `string` |
| **colorBodyContent**             | `string` |
| **colorBodySubContent**          | `string` |
| **colorBorder**                  | `string` |
| **colorError**                   | `string` |
| **colorErrorAccent**             | `string` |
| **colorErrorContent**            | `string` |
| **colorInfo**                    | `string` |
| **colorInfoAccent**              | `string` |
| **colorInfoContent**             | `string` |
| **colorPrimary**                 | `string` |
| **colorPrimaryAccent**           | `string` |
| **colorPrimaryContent**          | `string` |
| **colorSecondary**               | `string` |
| **colorSecondaryAccent**         | `string` |
| **colorSecondaryContent**        | `string` |
| **colorSuccess**                 | `string` |
| **colorSuccessAccent**           | `string` |
| **colorSuccessContent**          | `string` |
| **colorWarning**                 | `string` |
| **colorWarningAccent**           | `string` |
| **colorWarningContent**          | `string` |
| **fontFamily**                   | `string` |
| **fontLineHeight**               | `string` |
| **fontSizeHeading1**             | `string` |
| **fontSizeHeading2**             | `string` |
| **fontSizeHeading3**             | `string` |
| **fontSizeHeading4**             | `string` |
| **fontSizeHeading5**             | `string` |
| **fontSizeHeading6**             | `string` |
| **fontSizeLarge**                | `string` |
| **fontSizeRegular**              | `string` |
| **fontSizeRoot**                 | `string` |
| **fontSizeSmall**                | `string` |
| **fontWeightBold**               | `string` |
| **fontWeightMedium**             | `string` |
| **fontWeightRegular**            | `string` |
| **fontWeightSemibold**           | `string` |
| **focusRingColor**               | `string` |
| **focusRingWidth**               | `string` |
| **shadowResting**                | `string` |
| **shadowTopmost**                | `string` |
| **badgeRadius**                  | `string` |
| **buttonRadius**                 | `string` |
| **inputAdornmentColor**          | `string` |
| **inputBackgroundColor**         | `string` |
| **inputBorderColor**             | `string` |
| **inputBorderWidth**             | `string` |
| **inputContentColor**            | `string` |
| **inputDescriptionColor**        | `string` |
| **inputDisabledBackgroundColor** | `string` |
| **inputErrorColor**              | `string` |
| **inputLabelColor**              | `string` |
| **inputLabelFontSize**           | `string` |
| **inputLabelFontWeight**         | `string` |
| **inputPlaceholderColor**        | `string` |
| **inputRadius**                  | `string` |
| **transitionDuration**           | `string` |

## Usage

To customize the theme, pass a partial theme object to the `GustoProvider`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'

function App() {
  return (
    <GustoProvider
      theme={{
        colorPrimary: '#007bff',
        fontSizeRegular: '18px',
        inputRadius: '12px',
      }}
    >
      {/* Your app content */}
    </GustoProvider>
  )
}
```

## Default Values

The theme uses sensible defaults for all variables. You only need to specify the variables you want to customize.
