## Component Adapter FAQ

This FAQ addresses common questions and potential issues when working with the Component Adapter system in the Gusto Embedded React SDK.

### General Questions

#### Can I use a different UI framework for my custom components?

Yes, you can use any React UI framework or library for your custom components, as long as they correctly implement the required props and behaviors. For example, you could use Material UI, Chakra UI, or any other React-compatible UI library.

The only requirement is that your component adapter implements the `ComponentsContextType` interface.

#### How do I know which components I can customize?

You can customize any component defined in the `ComponentsContextType` interface ([View interface on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/useComponentContext.ts)). These are all the components in the SDK's UI directory. If you're unsure, you can refer to the [Component Inventory](./component-inventory) section.

#### Do I need to implement all components in the adapter?

No, you only need to implement the components you want to customize. The SDK will use its default components for any components not provided in your adapter.

If you're using `GustoProvider`, you automatically get all default components without needing to import them separately.

If you're using `GustoProviderCustomUIAdapter` and want to use a combination of custom and default components, merge your implementations with the `defaultComponents` export ([View on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)):

```tsx
import { defaultComponents } from '@gusto/embedded-react-sdk'

const myAdapter = {
  ...defaultComponents,
  Button: props => <MyCustomButton {...props} />,
  TextInput: props => <MyCustomTextInput {...props} />,
}
```

### Implementing Components

#### How do I implement components with complex behavior like ComboBox or DatePicker?

For complex components, you have a few options:

1. Use a third-party library that provides similar functionality
2. Implement a simplified version that meets your specific needs
3. Use the SDK's default implementation for complex components while customizing simpler ones

Instead of creating these complex components from scratch, we recommend referencing our default implementations to understand how we've structured them:

- [ComboBox implementation](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)
- [DatePicker implementation](https://github.com/Gusto/embedded-react-sdk/blob/main/src/contexts/ComponentAdapter/adapters/defaultComponentAdapter.tsx)

These implementations demonstrate how to properly handle accessibility, state management, and the various props required by each component.

To understand the expected behavior of complex components, you can also refer to their interface definitions:

- [ComboBox on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI/ComboBox)
- [DatePicker on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI/DatePicker)

#### My custom component isn't working correctly. What should I check?

1. **Ensure you've implemented all required props**: Each component has a specific set of props that it expects to receive and use. Make sure your component handles all of these props correctly.

2. **Check event handlers**: Pay special attention to event handlers like `onChange` and `onBlur`. The SDK expects these to be called with specific parameters.

3. **Verify accessibility**: The SDK's default components are built with accessibility in mind. Ensure your custom components maintain these accessibility features.

4. **Use the right types**: Make sure you're importing and using the correct prop types from the SDK.

5. **Debug with React DevTools**: Use React DevTools to inspect the props being passed to your components and compare with what you're expecting.

#### How can I ensure my custom components maintain accessibility features?

**Important**: When using the Component Adapter with your own custom components, you are responsible for ensuring accessibility compliance. The SDK's default components are built with accessibility in mind, but this accessibility is not automatically transferred to your custom implementations.

When implementing custom components, pay attention to:

- Proper labeling of form controls
- Appropriate ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast

The prop interfaces include properties like `aria-describedby`, `isInvalid`, and others that support accessibility. Make sure your custom implementations use these props correctly.

Study the default components to understand how they handle accessibility concerns. Check your own design system's accessibility guidelines and components, which likely have built-in accessibility features you can leverage.

### Troubleshooting

#### I'm getting errors about missing components. What's wrong?

If you're seeing errors about missing components and you're using `GustoProviderCustomUIAdapter`, you must implement all components that your integration needs. With the custom provider, you're responsible for providing every component used by the SDK in your adapter.

We recommend using `GustoProvider` instead if you only want to customize a few components. The `GustoProvider` automatically includes all default components and allows you to override just the specific components you want to customize, requiring less work from your end.

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

[Back to Component Adapter Overview](./component-adapter)
