---
title: Event Handling
description: Subscribe to SDK component events via onEvent callbacks for telemetry, navigation, and side effects — typed event constants and event payload shapes.
order: 1
---

The Gusto Embedded React SDK can communicate events with the parent application. An event can represent a user interaction (like selecting a CTA), a successful API response (like updating user information) or the completion of a step within a flow (like completing a form). Consumers of the React SDK can perform actions based on these events as needed. Some common use cases for events include implementing telemetry, performing navigation, or running side effects in your own application.

## Using events

Each of our React SDK components ships with an `onEvent` property. This is a function callback that is supplied with the event type and data associated with the user action. It takes the form:

```typescript typescript
(eventType: EventType, data?: unknown) => void
```

The `eventType` argument will be one of the constants from [`componentEvents`](../reference/events.md), which can be imported from the top level SDK import identical to any of the other exported components or utilities. See the [Events API reference](../reference/events.md) for the full list of constants and their string values.

The `data` argument can vary in shape and content. Some events will have no data and will simply indicate that a user is done with a step and is proceeding to the next step in the flow. When data is included it is typically the response from the associated API call. For example, when the `EMPLOYEE_CREATED` event is fired, it is called with the response data from the [create an employee endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees).

You can supply a function to this callback and respond to events as needed. In the following example we set up an event handler for the [`EmployeeOnboarding.Profile`](../reference/employee/onboarding/blocks.md#profile) component and execute code based on the event type:

```jsx jsx
import { EmployeeOnboarding, componentEvents } from '@gusto/embedded-react-sdk'

const handleEvent = (eventType, data) => {
  if (eventType === componentEvents.EMPLOYEE_CREATED) {
    const employeeId = data.uuid // data here is response from create employee endpoint
    // Your code here for when employee has been created
  }

  if (eventType === componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED) {
    const workState = data.state // data here is response from create employee work address endpoint
    // Your code here for when employee has been updated
  }

  if (eventType === componentEvents.EMPLOYEE_PROFILE_DONE) {
    // Your code here for when employee has submitted the profile and is
    // navigating or ready to navigate to the next step
    // Data is not defined in this case
  }
}

function MyApp({ companyId }) {
  return (
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <EmployeeOnboarding.Profile
        companyId={companyId}
        employeeId={employeeId}
        onEvent={handleEvent}
      />
    </GustoProvider>
  )
}
```

## Event types reference

For a complete list of every event constant and its string value, see the **[Events API reference](../reference/events.md)**. Each component that emits an event also documents the data payload it carries.
