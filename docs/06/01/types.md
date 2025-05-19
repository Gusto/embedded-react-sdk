## Component Adapter Types

The Component Adapter system uses TypeScript interfaces to ensure type safety and consistent behavior. Understanding these types is essential for creating custom component implementations that work correctly with the SDK.

### ComponentsContextType

This interface defines the shape of the component adapter object. It specifies every UI component that can be customized in the SDK ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts)):

```typescript
export interface ComponentsContextType {
  Alert: (props: AlertProps) => JSX.Element | null
  Badge: (props: BadgeProps) => JSX.Element | null
  Button: (props: ButtonProps) => JSX.Element | null
  ButtonIcon: (props: ButtonIconProps) => JSX.Element | null
  Card: (props: CardProps) => JSX.Element | null
  Checkbox: (props: CheckboxProps) => JSX.Element | null
  CheckboxGroup: (props: CheckboxGroupProps) => JSX.Element | null
  ComboBox: (props: ComboBoxProps) => JSX.Element | null
  DatePicker: (props: DatePickerProps) => JSX.Element | null
  OrderedList: (props: OrderedListProps) => JSX.Element | null
  UnorderedList: (props: UnorderedListProps) => JSX.Element | null
  NumberInput: (props: NumberInputProps) => JSX.Element | null
  Radio: (props: RadioProps) => JSX.Element | null
  RadioGroup: (props: RadioGroupProps) => JSX.Element | null
  Select: (props: SelectProps) => JSX.Element | null
  Switch: (props: SwitchProps) => JSX.Element | null
  TextInput: (props: TextInputProps) => JSX.Element | null
  Link: (props: LinkProps) => JSX.Element | null
  Menu: (props: MenuProps) => JSX.Element | null
  Table: <T>(props: TableProps<T>) => JSX.Element | null
  Heading: (props: HeadingProps) => JSX.Element | null
  Text: (props: TextProps) => JSX.Element | null
  CalendarPreview: (props: CalendarPreviewProps) => JSX.Element | null
  ProgressBar: (props: ProgressBarProps) => JSX.Element | null
}
```

Each component type (e.g., `ButtonProps`, `TextInputProps`) is defined in its respective file and exported from the SDK. These interfaces detail all the props that must be supported by your custom implementations.

### GustoProviderCustomUIAdapterProps

This interface defines the props for the `GustoProviderCustomUIAdapter` component ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/GustoProvider/GustoProviderCustomUIAdapter.tsx)):

```typescript
export interface GustoProviderCustomUIAdapterProps {
  config: {
    baseUrl: string
    headers?: Record<string, string | number>
  }
  dictionary?: ResourceDictionary
  lng?: string
  locale?: string
  currency?: string
  theme?: DeepPartial<GTheme>
  queryClient?: QueryClient
  components: ComponentsContextType
  children?: React.ReactNode
}
```

The key props are:

- `config`: Configuration for the API connection
- `components`: Your custom component adapter implementing `ComponentsContextType`
- `theme`: (Optional) Custom theming options
- `dictionary`: (Optional) Translation overrides
- `lng`: (Optional) Language setting
- `locale` and `currency`: (Optional) Localization settings

### Component Prop Types

Each UI component has its own prop interface. Here are some of the most commonly used ones:

#### TextInputProps

From [TextInputTypes.ts](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/TextInput/TextInputTypes.ts):

```typescript
export interface TextInputProps {
  label: string
  description?: ReactNode
  errorMessage?: ReactNode
  isRequired?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  id?: string
  name: string
  value?: string
  placeholder?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  inputRef?: React.RefObject<HTMLInputElement>
  shouldVisuallyHideLabel?: boolean
  // Plus any additional HTML input props
}
```

#### ButtonProps

From [ButtonTypes.ts](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Button/ButtonTypes.ts):

```typescript
export interface ButtonProps {
  children: ReactNode
  isDisabled?: boolean
  isLoading?: boolean
  isError?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  size?: 'small' | 'medium' | 'large'
  className?: string
  // Plus any additional HTML button props
}
```

### Importing Types

You can import these types from the SDK package:

```typescript
import type {
  ComponentsContextType,
  ButtonProps,
  TextInputProps,
  // ... other types as needed
} from '@gusto/embedded-react-sdk'
```

The SDK exports all component types, so you don't need to access the internal file structure to use them in your application.

### Type Safety

The Component Adapter system leverages TypeScript to ensure type safety:

1. **Compile-time checking**: TypeScript will flag any missing or incorrect props in your component implementations
2. **IDE support**: You get autocomplete and documentation for all required props
3. **Type inference**: TypeScript can infer the types of your event handlers and other callback functions

By following the type definitions, you can ensure that your custom components will integrate seamlessly with the SDK's business logic.

### Type Hierarchy

The component types often extend basic HTML element props to provide both the SDK-specific props and standard HTML attributes:

```typescript
// Simplified example
export interface TextInputProps extends HTMLInputAttributes {
  label: string
  // Other SDK-specific props
}
```

This means your implementations can accept and forward any standard HTML attributes to the underlying HTML elements.

For a complete reference of all component types, browse the [UI components directory](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI) in the SDK's source code.

[Back to Component Adapter Overview](../component-adapter.md)
