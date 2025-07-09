---
title: Providing your own data
order: 4
---

Where possible, the Gusto Embedded React SDK allows for providing your own data to SDK forms. You can do this by setting form default values with data from your application.

### Providing your own application data using default values

If an SDK component contains a form and has a `defaultValues` property, the `defaultValues` can be set with values from your own data if needed. `defaultValues` is an object with keys corresponding to each of the form fields.

For example, if we are rendering the `Employee.Compensation` component (which contains a basic form) we can supply default values as follows:

```jsx
import { Employee } from '@gusto/embedded-react-sdk';

function MyApp({ employeeId, startDate }) {
  // Hard coded here but could be from an API response or however your app data is stored
  const someApplicationData = {
    title: 'Mr. Manager',
    rate: '50',
    payment_unit: 'Hour',
  };

  return(
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <Employee.Compensation
        employeeId={employeeId}
        startDate={startDate}
        onEvent={() => {...}}
        defaultValues={someApplicationData}
      />
    </GustoProvider>
  );
}
```

This would result in:

![](https://files.readme.io/db4af956eb3ca4db36c8f67d3f67bc2c756ba5c9e18788456f337eaf5518a716-image.png)

Note that when you supply default values, they will be replaced if we have those values saved via the Gusto API already. For example, if we supplied the default values above and we were editing this employee but we already had compensation data saved for this employee, the saved data would take precedence over the default values.

Documentation for components that have the defaultValues property and the shape of defaultValues for those components can be seen by examining the props tables in the workflows documentation.
