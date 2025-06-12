Gusto Embedded React SDK is implemented to be flexible and seamlessly integrate with your application. Because of this, it does not have opinions on routing. Instead, React SDK aims to be easily integrated with whichever routing library you are using. This section will walk through an example of creating a workflow using [React Router](https://reactrouter.com/), but the same concepts should apply regardless of routing technology chosen.

### Required knowledge

Before starting, you might consider familiarizing yourself with documentation around composition, workflows, and event handling.

### Overview

For this exercise we’ll be creating the Employee Self Onboarding flow in [React Router](https://reactrouter.com/).

Employee Self Onboarding is comprised of the following steps:

```typescript
Employee.Landing
Employee.Profile
Employee.Taxes
Employee.PaymentMethod
Employee.DocumentSigner
Employee.OnboardingSummary
```

Each step is available as a subcomponent of `Employee` which can be imported as follows:

```typescript
import { Employee } from '@gusto/embedded-react-sdk'
```

For self onboarding to work, we’ll need to have access to the company id, and the employee id. Not all steps require the company id, but each will require the employee id.

### Creating the routes

Let’s create a simple router. This router will take the employee id and company id as parameters. We will then create a route corresponding to each step outlined above. Note: we’ll add the actual elements in the next step.

```typescript
import {
  createBrowserRouter,
} from 'react-router-dom';


const createEmployeeSelfOnboardingRouter = ({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: string;
}) =>
  createBrowserRouter(
    [
      {
        path: '/',
        element: <AppWrapperElement />,
        errorElement: <AppErrorElement />,
        children: [
          {
            path: '/',
          },
          {
            path: '/profile',
          },
          {
            path: '/taxes',
          },
          {
            path: '/payment_method',
          },
          {
            path: '/document_signer',
          },
          {
            path: '/onboarding_summary',
          },
        ],
      },
    ]
  );
```

### Creating components with navigation

Each component in the React SDK has an onEvent property. `onEvent` is fired when the users perform various actions for the SDK components (read more in the Event Handling documentation). When a component is ready for navigation, an event will be fired. We can hook into the event and configure our navigation.

In our first step in our flow, `Employee.Landing`, the `EMPLOYEE_SELF_ONBOARDING_START` event is fired when we are ready to proceed with the flow.

We can create a wrapper component around `Employee.Landing` and execute routing per our declared routes above when onEvent is fired with the `EMPLOYEE_SELF_ONBOARDING_START` event.

```jsx
import { Employee, componentEvents } from '@gusto/embedded-react-sdk';

function EmployeeLandingWrapper({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const navigate = useNavigate();

  return (
    <Employee.Landing
      employeeId={employeeId}
      companyId={companyId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_SELF_ONBOARDING_START) {
          navigate('/profile');
        }
      }}
    />
  );
}
```

Note that each flow component is meant to be independent and usable in isolation. When a user saves data in a given step, the component for that step will make an API call and actually save the user data. That means you can rearrange steps as desired. In this example we are navigating the user to the profile form after landing, but you could navigate to whichever step is desired according to the order you want the steps to be in.

### Putting it all together

Once we have our wrapper components configured with the correct navigation, we can supply them to our router that we configured in the first step. Here’s the full example with navigation configured for each step:

```jsx
import {
  Employee,
  useGetEmployeesByCompany,
  componentEvents,
} from '@gusto/embedded-react-sdk';
import '@gusto/embedded-react-sdk/style.css';
import React, { Suspense } from 'react';
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  useParams,
  useRouteError,
  useNavigate,
} from 'react-router-dom';

interface AppProps {
  companyId: string;
  employeeId: string;
}

function EmployeeLandingWrapper({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: string;
}) {
  const navigate = useNavigate();

  return (
    <Employee.Landing
      employeeId={employeeId}
      companyId={companyId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_SELF_ONBOARDING_START) {
          navigate('/profile');
        }
      }}
    />
  );
}

function EmployeeProfileWrapper({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: string;
}) {
  const navigate = useNavigate();

  return (
    <Employee.Profile
      employeeId={employeeId}
      companyId={companyId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_PROFILE_DONE) {
          navigate('/taxes');
        }
      }}
    />
  );
}

function EmployeeTaxesWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();

  return (
    <Employee.Taxes
      employeeId={employeeId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
          navigate('/payment_method');
        }
      }}
    />
  );
}

function EmployeePaymentMethodWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();

  return (
    <Employee.PaymentMethod
      employeeId={employeeId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE) {
          navigate('/document_signer');
        }
      }}
    />
  );
}

function EmployeeDocumentSignerWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate();

  return (
    <Employee.DocumentSigner
      employeeId={employeeId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_FORMS_DONE) {
          navigate('/onboarding_summary');
        }
      }}
    />
  );
}

function EmployeeOnboardingSummaryWrapper({ employeeId }: { employeeId: string }) {
  return (
    <Employee.OnboardingSummary
      employeeId={employeeId}
      onEvent={() => {}}
    />
  );
}

const createEmployeeSelfOnboardingRouter = ({
  companyId,
  employeeId,
}: {
  companyId: string;
  employeeId: string;
}) =>
  createBrowserRouter(
    [
      {
        path: '/',
        element: <AppWrapperElement />,
        errorElement: <AppErrorElement />,
        children: [
          {
            path: '/',
            element: <EmployeeLandingWrapper employeeId={employeeId} companyId={companyId} />,
          },
          {
            path: '/profile',
            element: <EmployeeProfileWrapper employeeId={employeeId} companyId={companyId} />,
          },
          {
            path: '/taxes',
            element: <EmployeeTaxesWrapper employeeId={employeeId} />,
          },
          {
            path: '/payment_method',
            element: <EmployeePaymentMethodWrapper employeeId={employeeId} />,
          },
          {
            path: '/document_signer',
            element: <EmployeeDocumentSignerWrapper employeeId={employeeId} />,
          },
          {
            path: '/onboarding_summary',
            element: <EmployeeOnboardingSummaryWrapper employeeId={employeeId} />,
          },
        ],
      },
    ]
  );

export default function App({ companyId, employeeId }: AppProps) {
  const router = createEmployeeSelfOnboardingRouter({
    companyId,
    employeeId,
  });
  return (
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <RouterProvider router={router} />
    </GustoProvider>
  );
}

```
