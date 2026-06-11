---
title: useEmployeeList
description: Headless data hook returning a paginated list of a company's employees, each decorated with the actions allowed for its onboarding state — delete, review, or cancel self-onboarding.
order: 10
---

# useEmployeeList

Fetches a paginated list of a company's employees and returns each one decorated with the actions allowed for its current onboarding state. You supply the layout; the hook manages fetching, pagination, the per-employee action set, and the mutations behind delete / review / cancel-self-onboarding.

```tsx
import { useEmployeeList } from '@gusto/embedded-react-sdk'
```

---

## Props

`useEmployeeList` accepts a single options object:

| Prop           | Type                                       | Required | Default | Description                                                              |
| -------------- | ------------------------------------------ | -------- | ------- | ------------------------------------------------------------------------ |
| `companyId`    | `string`                                   | Yes      | —       | The UUID of the company whose employees to list.                         |
| `employeeType` | `'active' \| 'onboarding' \| 'terminated'` | No       | —       | Filters the list and tailors the allowed actions. Omit to list everyone. |

### `employeeType` and server filtering

`employeeType` maps to the query parameters sent to the Gusto API and changes which actions appear on each row:

| `employeeType` | Server filter      | Extra action added to matching rows |
| -------------- | ------------------ | ----------------------------------- |
| `'active'`     | onboarded + active | `dismiss`                           |
| `'onboarding'` | not yet onboarded  | —                                   |
| `'terminated'` | terminated         | `rehire`                            |
| _(omitted)_    | all employees      | —                                   |

---

## Return Type

The hook returns a discriminated union on `isLoading`.

### Loading state

```typescript
{
  isLoading: true
  errorHandling: HookErrorHandling
}
```

While the first page is in flight (and no data has arrived yet), only `isLoading` and `errorHandling` are available. If the fetch fails, the hook stays in this branch with `errorHandling.errors` populated — check it before rendering a spinner. Subsequent page changes keep the previous page's data on screen (see [Pagination](#pagination)).

### Ready state

```typescript
{
  isLoading: false
  data: {
    employees: EmployeeWithActions[]
  }
  pagination: PaginationControlProps
  status: {
    isFetching: boolean
    isPending: boolean
  }
  actions: {
    onDelete: (employeeId: string) => Promise<void>
    onReview: (employeeId: string) => Promise<EmployeeOnboardingStatus | undefined>
    onCancelSelfOnboarding: (employeeId: string) => Promise<EmployeeOnboardingStatus | undefined>
  }
  errorHandling: HookErrorHandling
}
```

- **`data.employees`** — the current page of employees, each extended with an `allowedActions` array and a `primaryJob` (see [EmployeeWithActions](#employeewithactions)).
- **`status.isFetching`** — `true` whenever a page request is in flight, including background refetches that keep the previous page visible.
- **`status.isPending`** — `true` while a delete or onboarding-status mutation triggered by one of the `actions` is running. Use it to disable row controls.

---

## EmployeeWithActions

Each entry in `data.employees` is the API `Employee` entity plus two derived fields:

```typescript
interface EmployeeWithActions extends Employee {
  /** Actions permitted for this employee given its onboarding status and the employeeType filter. */
  allowedActions: EmployeeAction[]
  /** The employee's primary job, if one is marked primary. */
  primaryJob?: Job
}

type EmployeeAction = 'edit' | 'delete' | 'cancel_self_onboarding' | 'review' | 'dismiss' | 'rehire'
```

`allowedActions` is computed from the employee's `onboardingStatus`, `onboarded` flag, and the `employeeType` you passed. Render only the controls present in this array — it tells you which operations are valid for that row:

| Action                   | When it appears                                                                                    | Backed by a hook action          |
| ------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| `edit`                   | Not terminated, and onboarding is incomplete, pending invite, awaiting admin review, or completed. | No — you own the edit navigation |
| `cancel_self_onboarding` | Employee is mid self-onboarding (invited, started, or overdue).                                    | `actions.onCancelSelfOnboarding` |
| `review`                 | Employee finished self-onboarding and is ready for admin review.                                   | `actions.onReview`               |
| `delete`                 | Employee is not yet onboarded.                                                                     | `actions.onDelete`               |
| `dismiss`                | `employeeType === 'active'`.                                                                       | No — you own the dismiss flow    |
| `rehire`                 | `employeeType === 'terminated'`.                                                                   | No — you own the rehire flow     |

`edit`, `dismiss`, and `rehire` have no corresponding hook action — they signal that the operation is permitted so you can show the control and route to your own UI.

---

## Actions

Each action accepts an `employeeId` and runs a single API call, returning that call's data directly (these are simple actions, not form submissions, so there's no `create`/`update` wrapper). If the mutation fails, the error is captured in `errorHandling.errors`.

| Action                   | What it does                                                | Resolves to                                     |
| ------------------------ | ----------------------------------------------------------- | ----------------------------------------------- |
| `onDelete`               | Deletes the employee.                                       | `void`                                          |
| `onReview`               | Moves the employee into the admin-review onboarding status. | `EmployeeOnboardingStatus` (the updated record) |
| `onCancelSelfOnboarding` | Reverts the employee to admin-driven onboarding.            | `EmployeeOnboardingStatus` (the updated record) |

`onReview` and `onCancelSelfOnboarding` resolve to the updated `EmployeeOnboardingStatus` entity (or `undefined` if the call failed). Because all mutations run under the SDK's auto-invalidation contract, the list refetches automatically on success — you don't need to refetch manually.

```tsx
const onboardingStatus = await employeeList.actions.onReview(employee.uuid)
if (onboardingStatus) {
  console.log('New status', onboardingStatus.onboardingStatus)
}
```

---

## Pagination

The `pagination` object satisfies `PaginationControlProps` — the same shape the SDK's `PaginationControl` component adapter consumes — so you can hand it straight to your pagination UI:

```typescript
type PaginationControlProps = {
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (n: 5 | 10 | 25 | 50) => void
  currentPage: number
  totalPages: number
  totalCount?: number
  itemsPerPage?: 5 | 10 | 25 | 50
  isFetching?: boolean
}
```

Page changes use placeholder data: the previous page stays rendered while the next one loads, and `status.isFetching` flips to `true` during the request. This avoids a flash of empty content between pages.

---

## Error Handling

Like every SDK hook, `useEmployeeList` returns an `errorHandling` object in **both** the loading and ready branches, so you can always surface fetch errors and offer recovery:

```typescript
interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}
```

- **`retryQueries()`** — refetches the employee list after a failed fetch.
- **`clearSubmitError()`** — clears the most recent action (delete / review / cancel) error.

See [Error Handling](./hooks.md#error-handling) in the hooks overview for the full `SDKError` shape and category-by-category guidance. To merge this hook's errors with other queries on the same screen, pass it into [`composeErrorHandler`](./hooks.md#composing-multiple-hooks).

---

## Usage Example

```tsx
import {
  useEmployeeList,
  type UseEmployeeListReady,
  type EmployeeWithActions,
} from '@gusto/embedded-react-sdk'

function EmployeeListPage({ companyId }: { companyId: string }) {
  const employeeList = useEmployeeList({ companyId, employeeType: 'onboarding' })

  if (employeeList.isLoading) {
    const { errors, retryQueries } = employeeList.errorHandling
    if (errors.length > 0) {
      return (
        <div role="alert">
          {errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
          <button onClick={retryQueries}>Retry</button>
        </div>
      )
    }
    return <div>Loading...</div>
  }

  return <EmployeeListReady employeeList={employeeList} />
}

function EmployeeListReady({ employeeList }: { employeeList: UseEmployeeListReady }) {
  const { data, status, actions, pagination, errorHandling } = employeeList

  return (
    <div aria-busy={status.isFetching}>
      {errorHandling.errors.length > 0 && (
        <div role="alert">
          {errorHandling.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}

      <ul>
        {data.employees.map((employee: EmployeeWithActions) => (
          <li key={employee.uuid}>
            <span>
              {employee.firstName} {employee.lastName}
              {employee.primaryJob ? ` — ${employee.primaryJob.title}` : ''}
            </span>

            {employee.allowedActions.includes('review') && (
              <button
                disabled={status.isPending}
                onClick={() => employeeList.actions.onReview(employee.uuid)}
              >
                Review
              </button>
            )}

            {employee.allowedActions.includes('cancel_self_onboarding') && (
              <button
                disabled={status.isPending}
                onClick={() => employeeList.actions.onCancelSelfOnboarding(employee.uuid)}
              >
                Cancel self-onboarding
              </button>
            )}

            {employee.allowedActions.includes('delete') && (
              <button
                disabled={status.isPending}
                onClick={() => employeeList.actions.onDelete(employee.uuid)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <nav>
        <button onClick={pagination.handlePreviousPage} disabled={pagination.currentPage <= 1}>
          Previous
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={pagination.handleNextPage}
          disabled={pagination.currentPage >= pagination.totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  )
}
```
