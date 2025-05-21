## Component Adapter FAQ

This FAQ addresses common questions and potential issues when working with the Component Adapter system in the Gusto Embedded React SDK.

### General Questions

#### How do I know which components I can customize?

You can customize any component defined in the `ComponentsContextType` interface ([View interface on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts)). These are all the components in the SDK's UI directory. If you're unsure, you can refer to the [Component Inventory](./component-inventory.md) section.

#### Do I need to implement all components in the adapter?

No, you only need to implement the components you want to customize. The SDK will use its default components for any components not provided in your adapter.

To use a combination of custom and default components, merge your implementations with the `defaultComponents` export ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)):

```tsx
import { defaultComponents } from '@gusto/embedded-react-sdk'

const myAdapter = {
  ...defaultComponents,
  Button: props => <MyCustomButton {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
}
```

### Design and Styling

#### What's the difference between using the Component Adapter and just overriding the CSS?

The Component Adapter gives you full control over the implementation of UI components, including their structure, behavior, and styling. Overriding CSS only allows you to modify the appearance of the default components.

The Component Adapter is ideal when:

- You want to maintain visual consistency with your existing React design system
- You need to use specific UI component libraries that aren't compatible with the SDK's default styling
- You need to modify the behavior of components beyond what's possible with styling

#### How can I ensure my custom components maintain accessibility features?

When implementing custom components, pay attention to:

- Proper labeling of form controls
- Appropriate ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast

The prop interfaces include properties like `aria-describedby`, `isInvalid`, and others that support accessibility. Make sure your custom implementations use these props correctly.

The SDK components follow accessibility best practices by default. When creating custom implementations, study the default components to understand how they handle accessibility concerns. The SDK uses [React Aria](https://react-spectrum.adobe.com/react-aria/) for accessible components, which you can reference for implementation details.

### Implementing Components

#### How do I implement components with complex behavior like ComboBox or DatePicker?

For complex components, you have a few options:

1. Use a third-party library that provides similar functionality
2. Implement a simplified version that meets your specific needs
3. Use the SDK's default implementation for complex components while customizing simpler ones

For example, to implement a DatePicker with react-datepicker:

```tsx
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { DatePickerProps as SDKDatePickerProps } from '@gusto/embedded-react-sdk'

const MyCustomDatePicker = ({
  label,
  description,
  errorMessage,
  isRequired,
  isDisabled,
  isInvalid,
  id,
  name,
  value,
  onChange,
  minDate,
  maxDate,
  ...props
}: SDKDatePickerProps) => {
  return (
    <div className="date-field">
      <label htmlFor={id || name}>
        {label}
        {isRequired && <span aria-hidden="true"> *</span>}
      </label>
      {description && <div className="description">{description}</div>}
      <DatePicker
        id={id || name}
        selected={value}
        onChange={date => onChange && onChange(date)}
        disabled={isDisabled}
        minDate={minDate}
        maxDate={maxDate}
        className={isInvalid ? 'invalid' : ''}
      />
      {isInvalid && errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  )
}
```

To understand the expected behavior of complex components, refer to the SDK's implementations:

- [ComboBox on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI/ComboBox)
- [DatePicker on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI/DatePicker)

#### Can I use a different UI framework for my custom components?

Yes, you can use any UI framework or library for your custom components, as long as they correctly implement the required props and behaviors. For example, you could use Material UI, Chakra UI, or any other React-compatible UI library.

The only requirement is that your component adapter implements the `ComponentsContextType` interface.

#### My custom component isn't working correctly. What should I check?

1. **Ensure you've implemented all required props**: Each component has a specific set of props that it expects to receive and use. Make sure your component handles all of these props correctly.

2. **Check event handlers**: Pay special attention to event handlers like `onChange` and `onBlur`. The SDK expects these to be called with specific parameters.

3. **Verify accessibility**: The SDK's default components are built with accessibility in mind. Ensure your custom components maintain these accessibility features.

4. **Use the right types**: Make sure you're importing and using the correct prop types from the SDK.

5. **Debug with React DevTools**: Use React DevTools to inspect the props being passed to your components and compare with what you're expecting.

### Troubleshooting

#### I'm getting errors about missing components. What's wrong?

If you're seeing errors about missing components, it's likely that you haven't provided an implementation for all the components the SDK is trying to use. Make sure your component adapter includes all the components used by the SDK, or use the `defaultComponents` to provide fallbacks.

```tsx
import { defaultComponents } from '@gusto/embedded-react-sdk'

const myAdapter = {
  ...defaultComponents, // Include all default components
  // Override only what you need
  Button: props => <MyCustomButton {...props} />,
}
```

You can check which components are being used by examining the SDK's source code or by adding console logs to your adapter implementation.

#### My form values aren't being captured correctly. What might be wrong?

This often happens when the `onChange` handler in your custom form components isn't being called with the correct parameters. The SDK expects specific value formats from each component's onChange handler:

- Checkbox: `onChange(boolean)`
- DatePicker: `onChange(Date | null)`
- NumberInput: `onChange(number)`
- Select: `onChange(string)`
- TextInput: `onChange(string)`

Make sure your components are calling these handlers with the expected data types.

#### How can I test my component adapter?

You can create unit tests for your custom components using testing libraries like Vitest and React Testing Library. Test that your components:

1. Render correctly with various prop combinations
2. Call event handlers with the correct parameters
3. Handle state changes appropriately
4. Maintain accessibility

For examples of how the SDK tests its components, you can look at the test files located alongside each component in the UI directory. For instance, check out [Button.test.tsx](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Button/Button.test.tsx), [TextInput.test.tsx](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/TextInput/TextInput.test.tsx), and other test files in the [UI component directories](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI).

#### Can I contribute my component adapter back to the project?

If you've created a component adapter for a popular UI library (like Material UI, Chakra UI, etc.), we'd love to hear about it! While the Gusto Embedded React SDK doesn't directly maintain adapters for third-party libraries, we can help guide other users to community solutions.

Contact your Gusto Embedded representative if you'd like to share your adapter implementation with other partners.

[Back to Component Adapter Overview](../component-adapter.md)
