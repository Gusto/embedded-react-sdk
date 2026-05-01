---
title: Providing Your Own Data
sidebar_position: 4
---

The Gusto Embedded React SDK allows you to pre-fill forms with data from your application using the `defaultValues` prop.

## Using Default Values

If an SDK component contains a form and has a `defaultValues` property, you can set it with values from your own application data. The `defaultValues` object has keys corresponding to each form field.

```tsx
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId, startDate }) {
  const someApplicationData = {
    title: 'Mr. Manager',
    rate: '50',
    payment_unit: 'Hour',
  }

  return (
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <Employee.Compensation
        employeeId={employeeId}
        startDate={startDate}
        onEvent={() => {}}
        defaultValues={someApplicationData}
      />
    </GustoProvider>
  )
}
```

## Server Data Takes Precedence

When you supply default values, they are replaced if the Gusto API already has saved data for those fields. For example, if you provide default compensation data but the employee already has compensation saved, the saved data takes precedence over your defaults.

## Finding Available Default Values

Documentation for components that support `defaultValues` and the shape of the object for each component can be found in the workflow documentation prop tables.
