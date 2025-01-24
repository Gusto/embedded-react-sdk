The Gusto Embedded React SDK allows for flexible approaches when crafting experiences. You can use workflow components as needed to render complex user flows with a single component. You can also leverage the individual workflow steps in isolation, recompose them together in your desired order, and update them with your own content.

### Building with workflow components

Workflows are individual components that encapsulate complex, often multi step user interactions. Check out the `Workflows Overview` section to see the full list of available components.

Using a workflow has appeal because you can render an entire user flow with a single component. For example, we can render the entire employee onboarding flow which is comprised of tax forms, user details, and payment information by using a single component as follows:

```jsx
import { EmployeeOnboardingFlow } from '@gusto/embedded-react-sdk';

function MyApp({ companyId }) {
  return(
    <GustoApiProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <EmployeeOnboardingFlow companyId={companyId} onEvent={() => {...}} />
    </GustoApiProvider>
  );
}
```

The benefits of this approach are simplicity and ease of development. Many times, however, we need more customization than is possible when using workflow components directly. For those scenarios, the React SDK offers methods of composition where you can leverage pieces of the flow individually and put them together as needed.

### Using individual workflow pieces

Continuing with the previous example, say we wanted to render employee compensation UI (which is a step in the employee onboarding flow) in isolation. We could import that directly as follows:

```jsx
import { Employee } from '@gusto/embedded-react-sdk';

function MyApp({ employeeId, startDate }) {
  return(
    <GustoApiProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <Employee.Compensation
        employeeId={employeeId}
        startDate={startDate}
        onEvent={() => {...}}
      />
    </GustoApiProvider>
  );
}
```

![](https://files.readme.io/6fb4afca5b75cc9aac151e2ed873aa988b7ffc35dbcb3566b874d7cd8d323e64-image.png)

Each step of the employee onboarding flow can be imported like this in isolation and used directly as needed. (For a comprehensive list of employee onboarding components available [see the Employee Onboarding documentation here](?tab=t.ueez3pueaqpd#heading=h.ojoq455ctuev)).

Because each step is available for direct use in isolation, it is also possible to rearrange steps, compose them with your own content, or [integrate them with your routing infrastructure as outlined here](?tab=t.kl25ghwrpy9i#heading=h.n2ha5hq6v67a). For example, we could place this compensation form inside of an existing page inline with our own components, or we could use this as a step in a different flow entirely.

### Further customization

Individual flow components can be further decomposed, modified or rearranged. Every flow component makes its individual pieces available (header, actions, content, etc). This enables developers and designers to customize the layout and order according to their needs. The following example demonstrates how to break down the `Employee.Compensation` component (from the previous section) into subcomponents, insert additional content after the header, and insert custom styles around the actions.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId, startDate }) {
  return (
    <GustoApiProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <Employee.Compensation startDate={startDate} employeeId={employeeId} onEvent={() => {}}>
        <Employee.Compensation.Head />
        {/* Custom instructional message */}
        <p>Fill out all fields as best you can</p>
        <Employee.Compensation.List />
        <Employee.Compensation.Edit />
        {/* Actions wrapped in custom styling */}
        <div
          style={{
            borderTop: '1px solid #6C6C72',
            width: '100%',
            padding: '1rem',
            backgroundColor: '#F4F4F3',
          }}
        >
          <Employee.Compensation.Actions />
        </div>
      </Employee.Compensation>
    </GustoApiProvider>
  )
}
```

![](https://files.readme.io/b2108cbc99e8dda2b7e89fe95ea4b7dcc3ab18f4d96f36313a0be226ea6baed3-image.png)

The `Employee.Compensation` component can be broken out into individual subcomponents which can be rearranged or customized as needed. These subcomponents can be set as children, and provided in any order.

In the code sample above, we’ve provided some additional “Fill out all fields as best you can” helper text between the header and the edit form. We’ve also updated the actions to have a top border, gray background, and some more prominent actions by wrapping them in a dedicated div.
