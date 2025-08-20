---
title: Customizing the Gusto Embedded React SDK UI
order: 10
---

The Gusto Embedded React SDK UI is highly customizable. It is built to completely visually integrate with your application.

There are two mechanisms that can be used to customize the SDK UI:

- [Theming](../theming/theming.md) - Customizing the SDK UI design variables (e.g., color, typography, shadows, etc.)
- [Component Adapters](../component-adapter/component-adapter.md) - Replacing SDK UI components with your own UI components

Theming sets the visual baseline for all of the SDK UI, and it is recommended to use theming as a first pass to match your brand with the SDK. Component adapters are more complex to configure and should be used for advanced use cases if theming falls short.

### Theming

> See [theming](../theming/theming.md) for a complete usage guide.

Theming allows you to set typography and color styles universally and change the entire look of the UI to match your brand by specifying a limited set of values. For example:

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

The above code would change the primary colors (applied to elements like buttons and links) to red and white. It would also change the font family universally to 'Courier New'.

### Component Adapters

> See [component adapters](../component-adapter/component-adapter.md) for a complete usage guide.

Component adapters allow you to register your own UI components with the SDK. The SDK will then render those UI components instead of the default components. This can be a powerful feature if you already have a mature design system and would like those components to be used by the SDK. It can also be helpful if you have highly custom UI that cannot be reproduced with theming alone. For example:

```tsx
import { GustoProvider, type ButtonProps, type TextInputProps } from '@gusto/embedded-react-sdk'
import { MyButton } from 'my-codebase/src/my-components/MyButton'

function ButtonAdapter({
  isLoading = false,
  isDisabled = false,
  buttonRef,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <MyButton
      ref={buttonRef}
      disabled={isDisabled}
      loading={isLoading}
      onClick={onClick}
      {...props}
    >
      {children}
    </MyButton>
  )
},

function App() {
  return (
    <GustoProvider
      config={{ baseUrl: '/api/gusto/' }}
      components={{
        Button: ButtonAdapter, // Override just what you need
      }}
    >
      <EmployeeOnboardingFlow />
    </GustoProvider>
  )
}
```

## Creating a UI Customization Strategy

[Theming](../theming/theming.md) is the recommended approach for customizing your UI. For advanced customization, where theming is insufficient to completely match your application UI, you can use [component adapters](../component-adapter/component-adapter.md). Even if you opt for adapter usage, setting a theming baseline as outlined above can reduce your workload and maintenance overhead significantly. It's recommended to start with theming and then introduce adapters only as necessary.
