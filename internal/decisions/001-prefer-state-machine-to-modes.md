# Prefer State Machine to Modes

Date: 2025-02-11

Status: proposed

## Context

This document proposes using state machines to manage the state and transitions between components at both the flow level and the step level instead of using modes to control the state and transitions between components.

### Defining modes

When building in the React SDK, we have the concept of flows which is a task comprised of multiple different steps. For example, in employee onboarding a user will go through taxes, compensation, payment methods, etc.

These steps are often themselves made up of multiple steps. For example, compensation allows for viewing the list, adding a new job, editing an existing job, etc. Currently these are defined in components with a `mode` constant.

```tsx
const mode =
  'LIST' |
  'ADD_ADDITIONAL_JOB' |
  'ADD_INITIAL_JOB' |
  'EDIT_ADDITIONAL_JOB' |
  'EDIT_INITIAL_JOB' |
  'PROCEED'
```

As the user interacts with the component, the mode is tracked and updated via state. This is in contrast to the implementation of flows which leverage a state machine to manage the state and transitions between components.

### Challenges with modes

#### Limiting composition

Components implemented with mode have tightly coupled dependencies. For example, if we just wanted to display the document signer documents list in isolation, we would need to do the following:

```tsx
<Employee.DocumentSigner>
  <Employee.DocumentSigner.List />
</Employee.DocumentSigner>
```

DocumentSigner.List depends on having the parent DocumentSigner context via the `useDocumentSigner` hook and can't be used independently.

This also has implications for routing where a consumer may want to place each piece of compensation on a dedicated route.

#### Separation of concerns

Because a single component can have multiple different modes, it makes it difficult to separate concerns leading to logic that can be difficult to follow. For example, the following is an exerpt of the compensation actions:

```ts
{
  primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'LIST' && (
    <Button
      variant="secondary"
      onPress={() => {
        handleAdd()
      }}
      isDisabled={isPending}
    >
      {t('addAnotherJobCta')}
    </Button>
  )
}
{
  ((primaryFlsaStatus === FlsaStatus.NONEXEMPT && mode === 'ADD_ADDITIONAL_JOB') ||
    mode === 'EDIT_ADDITIONAL_JOB') && (
    <Button variant="secondary" onPress={handleCancelAddJob} isDisabled={isPending}>
      {t('cancelNewJobCta')}
    </Button>
  )
}
<Button
  onPress={() => {
    if (mode === 'LIST') {
      submitWithEffect('PROCEED')
    }

    if (mode === 'ADD_ADDITIONAL_JOB' || mode === 'EDIT_ADDITIONAL_JOB') {
      submitWithEffect('LIST')
    }

    if (mode === 'ADD_INITIAL_JOB' || mode === 'EDIT_INITIAL_JOB') {
      if (watchedFlsaStatus === FlsaStatus.NONEXEMPT) {
        submitWithEffect('LIST')
      } else {
        submitWithEffect('PROCEED')
      }
    }
  }}
  isLoading={isPending}
  variant="primary"
>
  {mode === 'EDIT_ADDITIONAL_JOB' || mode === 'ADD_ADDITIONAL_JOB'
    ? t('saveNewJobCta')
    : t('submitCta')}
</Button>
```

It also makes it challenging with the validation schemas. For example, the following schema defined for payment method:

```tsx
const CombinedSchema = v.union([
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    ...BankAccountSchema.entries,
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(false),
    hasBankPayload: v.literal(false),
  }),
  v.object({
    type: v.literal('Check'),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    split_by: v.literal('Percentage'),
    split_amount: v.pipe(
      ...
    ),
    priority: v.record(v.string(), v.number()),
  }),
  v.object({
    type: v.literal('Direct Deposit'),
    isSplit: v.literal(true),
    hasBankPayload: v.literal(false),
    split_by: v.literal('Amount'),
    priority: v.pipe(
      ...
    ),
    split_amount: v.record(v.string(), v.nullable(v.pipe(v.number(), v.minValue(0)))),
    remainder: v.string(),
  }),
])
```

Our schema ends up needing to account for both the schema for bank account entry form and the account split form.

#### Challenges with testing

In order to test components that use the current mode approach, we end up needing to render the component, simulate mode changes, and wait for the updated component state to render. This may be desirable for an integration test down the road, but where we want to stay lightweight this incurs a lot of overhead and delays in the testing environment and also leads to tests that are challenging to refactor since they are highly dependent on asserting the rendered content that results from the mode changes. See Compensation.test.tsx for an example of this.

## Decision

- Where we would previously use mode, moving forward we should leverage components with dedicated responsibilities. Ex. a step comprised of a list and two distinct forms would be comprised of components designated for each. (Note: we are looking to account for obvious cases where the functionality is distinct and there is a clear separation of concerns. For example this wouldn't necessarily apply for a form with an edit mode)
- Instead of a central provider component with a mode prop that extends base, each of these components would extend base and would be designed for use in isolation.
- Use a state machine to manage the state and transition between these components.
- Provide a central component that can provide parity with the current experience where the consumer is able to use a single component for a given step even when it has multiple portions (Ex. can still use Compensation or DocumentSigner).

From the consumer perspective, they are still able to use the composed component as they normally would. Ex. DocumentSigner below could be imported as it was previously and dropped onto a page. The difference is that the DocumentSigner itself would be primarily in charge of the state machine and compose the sub components together instead of managing the endpoints and form validation for everything all in one place.

### Examples

#### Company Document Signer

```
* DocumentSigner
|__ DocumentsList // Extends BaseComponent, can be used directly
|__ SignatureForm // Extends BaseComponent, can be used directly
|__ AssignSignatoryForm // Extends BaseComponent, can be used directly
|__ DocumentSigner // Initializes the context and instantiates the state machine
|__ DocumentSignerStateMachine // Defines the transitions and document signer logic
```

#### Compensation

```
* Compensation
|__ CompensationForm // Extends BaseComponent, can be used directly
|__ CompensationList // Extends BaseComponent, can be used directly
|__ Compensation // Initializes the context and instantiates the state machine
|__ CompensationStateMachine // Defines the transitions and compensation logic
```

### [WIP] Composition

With this approach, we still would want to allow the consumer to have flexibility to include, exclude, or modify the subcomponents as they were able to do previously. For example:

```tsx
<Compensation>
  <Compensation.Head />
  <Compensation.List />
  <Compensation.Edit />
  <Compensation.Actions />
</Compensation>
```

I propose that we include a `components` property that would allow this same level of customization:

```ts
function CustomCompensationForm({ employeeId, startDate }: CompensationFormProps) {
  return (
    <CompensationForm employeeId={employeeId} startDate={startDate}>
      <h1>Custom form title</h1>
      <CompensationForm.Form />
      <div style={{ background: 'blue', padding: 12, borderTop: '1px solid black' }}>
        Some custom content
        <CompensationForm.Actions />
      </div>
    </CompensationForm>
  )
}

function CustomCompensationList({ employeeId }: CompensationListProps) {
  return (
    <CompensationList employeeId={employeeId}>
      <CompensationList.Head />
      <CompensationList.List />
      <div style={{ background: 'gray', padding: 12, borderTop: '1px solid black' }}>
        Some custom content
        <CompensationList.Actions />
      </div>
    </CompensationList>
  )
}

<Compensation
  components={{
    list: CustomCompensationList,
    form: CustomCompensationForm,
  }}
/>
```

## Consequences

### Benefits

- Cleaner separation of concerns
- Smaller more dedicated components
- Better composition for the partner
- Improved testability (ability to test state machine in isolation)

### Drawbacks

- Duplication in some components with similar functionality

## Outstanding questions

- How do we handle components with modes that are not cleanly separated with pages? Ex. a component that has a radio always visible and content that changes based on the selection?
