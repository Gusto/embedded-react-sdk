# Component Adapters for Embedded React SDK

This project includes three different component adapters that can be used to customize the appearance and behavior of form components:

1. **Default (React Aria)** - The default components using React Aria for accessibility and styling
2. **Plain HTML** - Simple HTML components with minimal styling
3. **Material UI** - Components styled using the Material UI library

## How to Use the Adapters

### In Ladle Stories

When viewing the components in Ladle, you can switch between the three adapters using the toggle button in the bottom right corner of the screen. Each click will cycle through:

- React Aria (green button)
- Plain HTML (blue button)
- Material UI (red button)

### In Your Application

To use a specific adapter in your application, import it and provide it to the `ComponentsProvider`:

```jsx
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { MUIComponentAdapter } from './adapters/MUIComponentAdapter'

function MyApp() {
  return (
    <ComponentsProvider value={MUIComponentAdapter}>
      {/* Your application content */}
    </ComponentsProvider>
  )
}
```

## Available Components

All adapters implement the same set of components:

- **TextInput** - For text input fields
- **NumberInput** - For numeric input fields
- **Checkbox** - For single checkboxes
- **CheckboxGroup** - For groups of related checkboxes
- **ComboBox** - For combo boxes (dropdown with text input)
- **DatePicker** - For date selection
- **Radio** - For single radio buttons
- **RadioGroup** - For groups of related radio buttons
- **Select** - For dropdown selection
- **Switch** - For toggle switches

## Creating Custom Adapters

You can create your own adapter by implementing the `ComponentsContextType` interface. Use the existing adapters as a reference:

- `PlainComponentAdapter.tsx` - For plain HTML implementation
- `MUIComponentAdapter.tsx` - For Material UI implementation

Your adapter should implement all the components listed above with the appropriate props and behavior.
