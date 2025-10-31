# UI Flexibility Exploration for the React SDK

This document proposes a high-level solution that fits the updated partner requirements for SDK UI flexibility. This solution is inspired by composition patterns found in other SDKs that have successfully made their core functionalities available in flexible, UI-agnostic ways. It also leverages and enhances React SDK patterns we are already familiar with.

The proposed solution still needs stress testing and rigor that will come from prototyping. The purpose of presenting this document at this time is to gather initial feedback to determine if we should pursue this solution more in depth (via prototyping) _or_ if we have yet to find a solution that is a good candidate and need to continue iterating.

## Requirements

### Partner

- Partner should be able to place SDK CTAs anywhere on a page, even outside the bounds of a rendered SDK component
- Partner should have control over the ordering of SDK content
- Partner should have complete control over the layout for SDK components
- Partner should be able to choose what things render from the SDK and conditionally hide pieces that are not relevant

### SDK

- SDK existing components should largely be able to maintain their current APIs
- SDK should not require partners to deal with third party dependencies or APIs
- Solution should be able to be consistently applied across all SDK block components

### SDK Considerations

- Forms that conditionally render content
  - Ex. profile form, selecting self onboarding causes certain fields to be hidden
- Edit vs. create forms
  - Ex. creating a new employee job vs. editing an existing employee job
- Components that support multiple personas
  - Ex. admin onboarding vs. self onboarding
- Combo block components
  - Ex. like profile with both employee details and address details
- How do we deal with it if a partner combines domains?
- State taxes with fields which are rendered dynamically
- Suspense and initial loading of components
- Component loading states for updates and form submissions
- Error handling
- Should also include errors which should validate forms
- Form validation
- Internationalization and dictionary management

## Research

### Algolia React Instantsearch

Algolia is a platform that enables apps to integrate search functionality. They provide a suite of UI components that integrate with their search APIs like search bars, menus, filters etc.

Algolia UI components are available for use in React, but for consumers that already have their own design systems or have strong UI preferences they make their hooks available to use with all the underlying functionality.

Some examples

- [Menu UI component](https://www.algolia.com/doc/api-reference/widgets/menu/react), [useMenu hook](https://www.algolia.com/doc/api-reference/widgets/menu/react#hook)
  - [Usage example](https://instantsearchjs.netlify.app/stories/js/?path=/story/refinements-menu--default)
- [RangeInput UI component](https://www.algolia.com/doc/api-reference/widgets/range-input/react), [useRange hook](https://www.algolia.com/doc/api-reference/widgets/range-input/react#hook)
  - [Usage example](https://instantsearchjs.netlify.app/stories/js/?path=/story/refinements-rangeinput--default)
- [RefinementList UI component](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react), [useRefinementList hook](https://www.algolia.com/doc/api-reference/widgets/refinement-list/react#hook)
  - [Usage example](https://instantsearchjs.netlify.app/stories/js/?path=/story/refinements-refinementlist--default)

#### Additional notes

- Robust examples for the UI components
- Solid documentation for the hooks
- Consistent, predictable placement of the component documentation and hook documentation
- Shared naming conventions and types, easy to navigate

### Bloomreach Limitless UI

Similar search platform to algolia, they offer varying levels of abstraction with increasing opinions/flexibility. [See docs](https://documentation.bloomreach.com/discovery/docs/limitless-ui-react?utm_source=chatgpt.com#integration-levels)

Their snippet on integration levels:

> Bloomreach Limitless UI React offers multiple integration levels to suit different needs:
>
> - Web SDK Direct Usage: Use the @bloomreach/discovery-web-sdk directly for full control over API calls.
> - Context-Aware Hooks: Use hooks like useSearchBox to interact with the library's context
>   system.
> - Headless Components: Implement accessible, unstyled components (e.g., <SearchBox />) for a balance of functionality and customization.
> - Styled Components: Include an optional styling bundle for a complete out-of-the-box
>   experience.

#### Additional notes

- Usage of the compound component pattern to enable flexibility with the UI component ordering
- Harder to find their comprehensive documentation (ex. [storybook stories have component documentation](https://bloomreach.github.io/limitless-ui-react/?path=/docs/hooks-usesearch--docs) but not hooks, they only have a few of those)
- Interesting to see their levels of separation include a hook option as well as a headless component option

## Stream React Components

SDK to build chat UI with Stream, this one is more similar in complexity to what we navigate with the SDK. [See docs](https://getstream.io/chat/docs/sdk/react/)

Stream uses a combination of UI components, hooks, and render properties on components to maintain UI flexibility. Theirs is a little more challenging to get a clear pattern.

It seems like hooks are used in this case to communicate with their chat context, but it's not necessarily a 1:1 swap with everything you need to replace their UI components. Hook functionality is also much more spread out.

## Solution considerations

The following considerations informed the proposed solution.

### Compatible with existing infrastructure

A solution should be compatible with the existing SDK infrastructure in a way that can make use of our work up to this point. In other words, fundamental problems like error handling, loading states, and everything we are getting from our Base components should be preserved if possible to avoid needing to solve these problems from scratch over again.

### Anchored in SDK visual design

A solution should be anchored to our SDK visual design. This is a key decision point as we could attempt to generalize our hooks in a way that makes them more agnostic to specific designs. Ex. in the profile, we will design our solution to serve the needs of the existing form composition with conditional fields rendering on self-onboarding since that is our SDK design paradigm. We will not attempt to make a more general employee profile helper that simply interfaces with the endpoint with no concern about self-onboarding status. Consumers that need that level of flexibility are actually API customers. In the SDK we are attempting to share our payroll expertise with consumers in a way that allows them to not have to think about these kinds of details. The goal is to let them leverage that expertise while having the flexibility to design within constraints, not to remove the constraints entirely.

This is also for the sake of our engineering approach, as building agnostic hooks forces us to live in hypotheticals which can be time-consuming.

### Counterpoints

- With more time and flexibility, should we be more open to deeper SDK changes up to and including reconsidering the infrastructure?
- Is there a middle ground where we are building hooks that still lend themselves to ease of implementing our SDK visual design but are less opinionated? Do we need to dive deeper and reconsider what visual design elements are preferences on our part vs. constraints that are actually informed by payroll domain expertise?

## React SDK Component Hooks

We propose creating hooks for React SDK block level components (ex. Profile, Address etc). Each component will have a dedicated Provider which will manage the API calls, form validation, and business logic and make that available to child components via an associated hook (ex. useEmployeeProfile).

- We export the hooks associated with the components so that consumers can provide completely custom children with access to the component state and API results
- The provider components do not render any layout content so we don't interfere with any partner styling; when partners supply custom children they completely take care of the layout
- We centralize the form handling and make it easy for consumers to connect their inputs to our form validation

### Existing Profile component

The existing Profile component continues to work as-is:

```tsx
<Employee.Profile employeeId="some-employee-id" companyId="some-company-id" />
```

### Internals of the component render method

These are updated to use the ProfileProvider instead

```tsx
// Employee/Profile/Profile.tsx

// Profile component API calls etc
return (
  <ProfileProvider {...profileProviderProps}>
    <Flex flexDirection="column" gap={32}>
      <ProfileHeader /> // Components use `useEmployeeProfile` internally
      <ProfileForm />
      <ProfileActions />
    </Flex>
  </ProfileProvider>
)
```

### Consumers using the provider component directly

Consumers can implement their own custom components using the provider + associated hook:

```tsx
const MyApp = () => {
  const formId = useId()

  return (
    <Employee.ProfileProvider employeeId="some-employee-id" companyId="some-company-id">
      <CustomLayoutComponent>
        <CustomHeader />
        <CustomForm id={formId} />
      </CustomLayoutComponent>
      <button type="submit" form={formId}>
        Save Profile
      </button>
    </Employee.ProfileProvider>
  )
}

const CustomHeader = () => {
  const { isAdmin } = useEmployeeProfile()

  return <h1>{isAdmin ? 'Enter details for your employee' : 'Enter your details'}</h1>
}

const CustomForm = ({ id }: { id: string }) => {
  const { fields, onSubmit } = useEmployeeProfile()
  const { firstName, lastName, email } = fields.adminFields || fields.selfOnboardingFields || {}

  return (
    <form id={id} onSubmit={onSubmit}>
      <input type="text" {...firstName} placeholder="First Name" />
      <input type="text" {...lastName} placeholder="Last Name" />
      <input type="email" {...email} placeholder="Email" />
    </form>
  )
}

const CustomLayoutComponent = ({ children }: { children: ReactNode }) => (
  <div style={{ backgroundColor: 'gray', padding: '1rem' }}>{children}</div>
)
```

### Forms

Forms present enormous complexity. That also means this is a key opportunity to help partners with implementation.

#### SDK form use cases

- Basic - inputs are known to us and don't change (Ex. contractor address form)
- Conditionally rendered - inputs are all known to us, they just are rendered conditionally based on the component/form state (Ex. profile)
- State tax case - inputs are defined in the API but they are not really known to us beyond having string identifiers and they shift dynamically based on the work address
- The edit employee payroll case - inputs are dynamic based on the employee type and can vary. We know a superset of the inputs that can render, but the actual rendered inputs vary by employee type

#### Basic form

```tsx
const MyApp = () => {
  const formId = useId()

  return (
    <Contractor.AddressProvider contractorId="some-contractor-id">
      <CustomForm id={formId} />
      <CustomActions form={formId} />
    </Contractor.AddressProvider>
  )
}

const CustomForm = ({ id }: { id: string }) => {
  const { fields, onSubmit } = useContractorAddress()

  const { street1, street2, state, zip } = fields

  return (
    <form onSubmit={onSubmit}>
      <label>
       Street 1
       <input {...street1} />
      </label>
      <label>
       Street 2
       <input {...street2} />
      </label>
      <label>
       Choose your state
       <select {...state} />
      </label>
      <label>
       Zip Code
       <input {...zip} />
      </label>
    </form>
  )
}

const CustomActions = ({ form }: { form: string }) => {
  return <button type="submit" form={form}>Submit</button>
}

// Return value of useContractorAddress:
function useContractorAddress() {
  ...
  return {
    ...
    fields: {
      street1: {
        type: 'text',
        onChange: onChangeStreet1,
        onBlur: onBlurStreet1,
        inputRef: street1InputRef,
        value: street1,
        isInvalid: isStreet1Invalid,
        errorMessage: street1ErrorMessage, // TODO: Explore possibility of these as error codes that are documented (similar to translation keys now) which allow partners to provide their own copy
      },
      state: {
        type: 'singleSelection',
        onChange: onChangeState,
        onBlur: onBlurState,
        options: { 'AK', 'AL' ...etc }, // These represent keys that they can pass back as the value, they can present them to the user how they want
        inputRef: stateRef,
        value: state,
        isInvalid: isStateInvalid,
        errorMessage: stateErrorMessage,
      },
      ...etc etc
    }
  }
}
```

#### Forms with conditional inputs

In these cases, the inputs are known; we just render them conditionally based on the form state

```tsx
const MyApp = () => {
  const formId = useId()

  return (
    <Employee.ProfileProvider employeeId="some-employee-id" companyId="some-company-id">
      <CustomForm id={formId} />
      <CustomActions formId={formId} />
    </Employee.ProfileProvider>
  )
}

const CustomForm = ({ id }: { id: string }) => {
  const { fields, onSubmit } = useEmployeeProfile()

  const { adminFields, adminSelfOnboardingInvitedFields, selfOnboardingFields } = fields

  if (adminFields) {
    const {
      selfOnboarding,
      firstName,
      middleName,
      lastName,
      workAddress,
      startDate,
      email,
      ssn,
      birthday,
      street1,
      street2,
      city,
      state,
      zip,
      courtesyWithholding,
    } = adminFields

    return (
      <form id={id} onSubmit={onSubmit}>
        <input type="text" {...firstName} />
        <input type="text" {...lastName} />
        ...etc etc
      </form>
    )
  }

  if (adminSelfOnboardingInvitedFields) {
    const { selfOnboarding, firstName, middleName, lastName, workAddress, startDate, email } =
      adminSelfOnboardingInvitedFields

    return (
      <form id={id} onSubmit={onSubmit}>
        <input type="text" {...firstName} />
        <input type="text" {...lastName} />
        ...etc etc
      </form>
    )
  }

  if (selfOnboardingFields) {
    const {
      firstName,
      middleName,
      lastName,
      ssn,
      birthday,
      street1,
      street2,
      city,
      state,
      zip,
      courtesyWithholding,
    } = selfOnboardingFields

    return (
      <form id={id} onSubmit={onSubmit}>
        <input type="text" {...firstName} />
        <input type="text" {...lastName} />
        ...etc etc
      </form>
    )
  }

  // default case, shouldn't get here?
  return null
}

const CustomActions = ({ form }: { form: string }) => {
  return (
    <button type="submit" form={form}>
      Submit
    </button>
  )
}
```

#### State taxes case

State taxes is challenging because we have unique identifiers for the form fields, but they are controlled by the API, so they are not known to us at build time and vary dynamically based on the API response.

We can still follow the same approach as above; we just lose the strong typing and will need the keys to be strings, which will make it harder for the consumer to intercept them and reorder.

This should be an acceptable tradeoff given state taxes are inherently complex.

```tsx
const MyApp = () => {
  const formId = useId()

  return (
    <Employee.StateTaxesProvider employeeId="some-employee-id">
      <CustomForm id={formId} />
      <CustomActions form={formId} />
    </Employee.StateTaxesProvider>
  )
}

const CustomForm = ({ id }: { id: string }) => {
  const {
    fields,
    onSubmit
  } = useStateTaxes()

  // If the consumer knows the field key, they can index into the fields and pull it out for reordering.
  // It would be complex, but doing `const withholding = fields['state-withholding'] would work

  return (
    <form id={id} onSubmit={onSubmit}>
      {Object.entries(fields).map(([key, props]) => (
        <input key={key} {...props />
      ))}
    </form>
  )
}

const CustomActions = ({ form }: { form: string }) => {
  return <button type="submit" form={form}>Submit</button>
}
```

#### Payroll edit case

In the payroll edit case, we know the possible inputs available, but they may or may not be rendered based on the current employee.

```tsx
const MyApp = () => {
  const formId = useId()

  return (
    <Payroll.EditEmployeeProvider payrollId="some-payroll-id" employeeId="some-employee-id">
      <CustomForm id={formId} />
      <CustomActions form={formId} />
    </Payroll.EditEmployeeProvider>
  )
}

const CustomForm = ({ id }: { id: string }) => {
  const {
    fields,
    onSubmit
  } = usePayrollEditEmployee()

  const { hours, additionalEarnings, reimbursement, paymentMethod } = fields

  return (
    <form id={id} onSubmit={onSubmit}>
      {Object.entries(hours).map(([jobName, jobFields]) => (
        <div key={jobName}>
          {Object.entries(jobFields).map(([hoursName, hoursProps]) => (
            <input {...hoursProps} />
          )}
        </div>
      ))}
      {Object.entries(additionalEarnings).map(...etc etc)}
      {Object.entries(reimbursement).map(...etc etc)}
      ...etc etc
    </form>
  )
}

const CustomActions = ({ form }: { form: string }) => {
  return <button type="submit" form={form}>Submit</button>
}
```

### Error handling

Error handling still needs deeper evaluation, but because the root component still uses the `Base` component, we should get all of our current error handling as currently implemented.

We may need to allow further customization of the errors displayed to the user. One way we could do this is to also pass the processed error information (which we are currently using to render the alert) to the `Base` context, and then make that available to the component context (ex. `Employee.Profile`) via the provider. We will need to investigate this more. We will also need to better consider the implications of making translations workable.

### Translations

We look to avoid translations where possible in our hooks and place translations in the UI layer. This will allow the consumer to have complete control over their strings.

Edge cases:

- Error messages for inputs
  - Consider providing error codes for validation messages which are well documented. We can make these available via a TS constant/enum which they can use to map their own error messages
- Translations returned for the labels, descriptions, and validation text on state taxes. We would need to either map these to known input codes that could be defined by the consumer for each state. Or we would need to supply these by default. Doing a mix of both where we just pipe in the label/description/validation text from the api response, but the consumer is able to identify the input seems like a good balance.

## Tradeoffs

### Advantages of this approach

- Enable the flexibility requested by partners to reorder or omit content
- Allow CTA placement outside of content
- Better positions us to have separation of concerns (potentially even a dedicated headless package separated from the UI)
- Partners still get our SDK knowledge without our UI opinions

### Overhead for partners

It's hard to say if overhead for partners is a drawback of this approach. Our current block components for the SDK will still be available for partner use with enhanced flexibility to hide headers and customize the actions. Those operations require minimal overhead. The biggest complexity add is wiring up forms. This, however, is a highly custom feature that would only make sense for a partner with very high flexibility needs. This partner would have built with the API directly in the absence of these utilities, so really we're competing with a direct API build. We have to ask ourselves if we think this approach is more straightforward than utilizing the API directly. The partner is getting all of our form handling, validation, and API calls out of the box.

### Limitations for partners

There are still limitations/constraints for partners. One of these is that partners will still be constrained by our design choices. The SDK components and hooks are still optimized to build the SDK UI as designed on our end. Partners will have control over reordering that content and presenting it how they choose, but ultimately we will be the ones choosing that content. The goal here is to meet the requirements within reason.

### Further drawbacks

The biggest drawback is the engineering overhead on our end to maintain this refactor.

- It will require hook APIs to be designed for consumer use
  - More conversations about naming, considerations of ergonomics for partners, debates about what should/should not be available to partner engineers vs. implementation details
  - More considerations for breaking changes and constraints on how we can refactor because we've now exposed component internals
- It will require engineering building out new approaches like error codes in order to allow partners to know what translations to render without actually passing them the translations
- More items to document since we will need to document the components and their associated hooks

## Alternatives considered

While the Provider + hooks approach is the proposed solution, the following alternatives were evaluated:

### Pure hooks approach

The Provider approach is designed to be adjacent to our existing application infrastructure to avoid needing to revisit the same problems. There is a world where we could do pure hooks. Ex. instead of doing:

```tsx
const MyApp = () => {
  return (
    <Employee.ProfileProvider employeeId="some-employee-id" companyId="some-company-id">
      <CustomHeader />
      <CustomForm />
    </Employee.ProfileProvider>
  )
}

const CustomHeader = () => {
  const { isAdmin } = useEmployeeProfile()

  return <h1>{isAdmin ? 'Enter details for your employee' : 'Enter your details'}</h1>
}
```

Just doing:

```tsx
const MyApp = () => {
  const { isAdmin } = useEmployeeProfile({
    employeeId: 'some-employee-id',
    companyId: 'some-company-id',
  })

  return (
    <div>
      <h1>{isAdmin ? 'Enter details for your employee' : 'Enter your details'}</h1>
    </div>
  )
}
```

In this approach the hooks would be standalone. This would eliminate the restriction that they need to be used within a Provider wrapper (ex. needing to have `Employee.ProfileProvider` as the root component).

This would technically enable even more flexibility and the cleanest separation of concerns. However, I moved away from this approach in the ideation phase since it would require enormous updates to infrastructure.

- We would need to get away from `Base` for our components and refactor it to be a hook
- We would need to refactor all of our queries to no longer be suspense queries and manually track the loading states (else we would need to impose requirements on partners to implement these within suspense boundaries)
- We would need to revisit how we do error handling, providing the error as a result of the hook (not a huge drawback since we may need to do this anyway)

**Why not chosen:** While this enables slightly more flexibility, it would require significant infrastructure changes (refactoring `Base` to a hook, converting all suspense queries, reworking error handling) for minimal additional benefit. The regression risk and maintenance burden outweigh the marginal flexibility gains.

### Fine-grained component approach

Another option considered was creating individual components for every form field. Ex doing:

```tsx
const MyApp = () => {
  return (
    <Employee.ProfileProvider employeeId="some-employee-id" companyId="some-company-id">
      <Employee.Profile.FirstName />
      <Employee.Profile.LastName />
      <Employee.Profile.Ssn />
      More custom content
      <Employee.Profile.Actions />
    </Employee.ProfileProvider>
  )
}
```

This would basically make every input available as a pre-built component that subscribes to the form context.

**Why not chosen:** This would require creating and maintaining individual components for every form field, which is significant overhead. More critically, this pattern doesn't scale well to our complex form scenarios: unknown inputs (taxes), conditional inputs (profile), and dynamic inputs (payroll edit employee). The proposed Provider + hooks approach provides better ergonomics for these cases while still allowing partners to build their own field-level components if desired.

## Next steps

If we feel we have confidence in this approach, we can move forward with a deeper prototyping phase to iron out the ambiguities and stress test it with real examples.

If there is sufficient doubt or we feel there are still alternatives worth exploring we can repeat this process with a different approach and continue iterating.
