# Component Structure

## Block components

Block components are focused, reusable components that serve specific functionality. They follow these patterns:

- **Single Purpose**: Each component should generally handle a specific task (e.g., list, form, etc.)
- **Base Component**: Uses [BaseComponent](../src/components/Base/Base.tsx) for consistent behavior and error handling

### Examples

- [DocumentList](../src/components/Company/DocumentSigner/DocumentList/DocumentList.tsx)
- [LocationForm](../src/components/Company/Locations/LocationForm/LocationForm.tsx)

## Flow components

Flow components compose block components and possibly other flow components together using state machines to manage transitions. They follow these patterns:

- **State Management**: Uses the [Flow](../src/components/Flow/Flow.tsx) component with a state machine to handle transitions
- **Component Composition**: Can compose both block components (e.g., list → form) and/or other flow components

For example, `Employee.OnboardingFlow` composes both block components (profile, taxes) and other flow components (document signer) to create a complete onboarding experience.

### Examples

- [DocumentSigner](../src/components/Company/DocumentSigner/DocumentSigner.tsx)
- [Locations](../src/components/Company/Locations/Locations.tsx)
- [Employee.OnboardingFlow](../src/components/Employee/OnboardingFlow/OnboardingFlow.tsx)
