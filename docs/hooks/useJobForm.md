---
title: useJobForm
order: 4
---

# useJobForm

Creates or updates an employee's job — title, hire date, S-Corp 2% shareholder flag, and Washington state workers' compensation fields. Companion hook to `useCompensationForm`: jobs and their compensations are separate entities in the Gusto API, and this hook focuses exclusively on the job side.

```tsx
import { useJobForm, SDKFormProvider } from '@gusto/embedded-react-sdk'
```

A wrapper hook, [`useCurrentJobForm`](#usecurrentjobform), automatically resolves the employee's primary job and threads its UUID into `useJobForm` — useful for steady-state edit screens that don't ask the partner to choose a specific job.

---

## Props

`useJobForm` accepts a single options object:

| Prop                      | Type                                                           | Required | Default      | Description                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------- | -------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `employeeId`              | `string`                                                       | No       | —            | The UUID of the employee. Optional for composed flows where the ID is created in the same submit chain — pass it via submit options instead. |
| `jobId`                   | `string`                                                       | No       | —            | When present → **update** mode (PUT /v1/jobs/:id with `version`). When absent → **create** mode (POST /v1/employees/:id/jobs).               |
| `optionalFieldsToRequire` | `JobOptionalFieldsToRequire`                                   | No       | —            | Override fields that are optional on a given mode to be required. See [Configurable Required Fields](#configurable-required-fields).         |
| `defaultValues`           | `Partial<JobFormData>`                                         | No       | —            | Pre-fill form values. Server data takes precedence on update.                                                                                |
| `validationMode`          | `'onSubmit' \| 'onBlur' \| 'onChange' \| 'onTouched' \| 'all'` | No       | `'onSubmit'` | Passed through to react-hook-form.                                                                                                           |
| `shouldFocusError`        | `boolean`                                                      | No       | `true`       | Auto-focus the first invalid field on submit. Set to `false` when using `composeSubmitHandler`.                                              |

### Configurable Required Fields

| Field                   | Rule       | Required on create | Required on update | Partner-configurable? |
| ----------------------- | ---------- | ------------------ | ------------------ | --------------------- |
| `title`                 | `'create'` | Yes                | No                 | Yes (on update)       |
| `hireDate`              | `'create'` | Yes                | No                 | Yes (on update)       |
| `twoPercentShareholder` | `'never'`  | No                 | No                 | Yes (either mode)     |
| `stateWcCovered`        | `'never'`  | No                 | No                 | Yes (either mode)     |
| `stateWcClassCode`      | predicate  | When WC is covered | When WC is covered | No (auto)             |

```typescript
type JobOptionalFieldsToRequire = {
  create?: Array<'twoPercentShareholder' | 'stateWcCovered'>
  update?: Array<'title' | 'hireDate' | 'twoPercentShareholder' | 'stateWcCovered'>
}
```

`stateWcClassCode` is automatically required when `stateWcCovered` is `true` regardless of `optionalFieldsToRequire`.

### JobFormData

The shape of `defaultValues`:

```typescript
interface JobFormData {
  title: string
  hireDate: string | null // ISO date string (YYYY-MM-DD) or null
  twoPercentShareholder: boolean
  stateWcCovered: boolean
  stateWcClassCode: string
}
```

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

### Ready state

```typescript
{
  isLoading: false
  data: {
    currentJob: Job | null            // null in create mode
    jobs: Job[] | undefined           // all employee jobs (when employeeId is set)
    employee: Employee | null
    currentWorkAddress: EmployeeWorkAddress | null
    showTwoPercentShareholder: boolean // true when company is taxable as S-Corp
    showStateWc: boolean               // true when active work-address state is WA
  }
  status: {
    isPending: boolean
    mode: 'create' | 'update'
  }
  actions: {
    onSubmit: (options?: JobSubmitOptions) => Promise<HookSubmitResult<Job> | undefined>
  }
  errorHandling: HookErrorHandling
  form: {
    Fields: JobFormFields
    fieldsMetadata: JobFieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn }
    getFormSubmissionValues: () => JobFormOutputs | undefined
  }
}
```

### Submit options

```typescript
interface JobSubmitOptions {
  /** Override the employeeId configured at hook construction. Useful when the employee is created in the same submit chain. */
  employeeId?: string
}
```

`onSubmit` resolves to a `HookSubmitResult<Job>` containing both the mode (`'create' | 'update'`) and the saved `Job` entity, so partners read the result directly rather than wiring step callbacks.

---

## Verb routing

The hook auto-routes between create and update based on `jobId`:

| Hook config                                  | Mode   | API call                                      |
| -------------------------------------------- | ------ | --------------------------------------------- |
| `{ employeeId, jobId }`                      | update | `PUT /v1/jobs/:jobId` (with `version`)        |
| `{ employeeId }` (no `jobId`)                | create | `POST /v1/employees/:employeeId/jobs`         |
| `{}` (no `employeeId`) + submit `employeeId` | create | `POST /v1/employees/:options.employeeId/jobs` |

Important note for onboarding: creating a job auto-creates a stub compensation. Capture `currentCompensationUuid` (and the compensation's `version` from `compensations[]`) from the create response and thread them into `useCompensationForm.actions.onSubmit({ jobId, compensationId, compensationVersion })` to update the stub. See [hooks.md](./hooks.md#composing-job--compensation).

---

## Fields Reference

### Error Codes

```typescript
const JobErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const
```

### Fields.Title

Text input for the job title.

| Prop                 | Type                            | Required |
| -------------------- | ------------------------------- | -------- |
| `label`              | `string`                        | Yes      |
| `description`        | `ReactNode`                     | No       |
| `validationMessages` | `{ REQUIRED: string }`          | No       |
| `FieldComponent`     | `ComponentType<TextInputProps>` | No       |

**Required on create.** Optional on update unless `optionalFieldsToRequire.update` includes `'title'`.

> Submitting this field on update applies the title change immediately to the active role. When the title change should instead take effect on a future date alongside a rate change, bind it via [`useCompensationForm.Fields.Title`](./useCompensationForm.md#fieldstitle) and omit `Fields.Title` here.

```tsx
<Fields.Title label="Job title" validationMessages={{ REQUIRED: 'Job title is required' }} />
```

---

### Fields.HireDate

Date picker for the employee's hire date for this job.

| Prop                 | Type                             | Required |
| -------------------- | -------------------------------- | -------- |
| `label`              | `string`                         | Yes      |
| `description`        | `ReactNode`                      | No       |
| `validationMessages` | `{ REQUIRED: string }`           | No       |
| `FieldComponent`     | `ComponentType<DatePickerProps>` | No       |

**Required on create.** Optional on update unless `optionalFieldsToRequire.update` includes `'hireDate'`.

```tsx
<Fields.HireDate label="Hire date" validationMessages={{ REQUIRED: 'Hire date is required' }} />
```

---

### Fields.TwoPercentShareholder

Checkbox indicating whether the employee is a 2% shareholder in an S-Corporation.

| Prop             | Type                           | Required |
| ---------------- | ------------------------------ | -------- |
| `label`          | `string`                       | Yes      |
| `description`    | `ReactNode`                    | No       |
| `FieldComponent` | `ComponentType<CheckboxProps>` | No       |

**Conditional availability:** This field is `undefined` when `data.showTwoPercentShareholder` is `false` (the company is not taxable as an S-Corp).

```tsx
{
  Fields.TwoPercentShareholder && (
    <Fields.TwoPercentShareholder label="Select if employee is a 2% shareholder" />
  )
}
```

---

### Fields.StateWcCovered

Radio group for Washington state workers' compensation coverage.

| Prop             | Type                             | Required |
| ---------------- | -------------------------------- | -------- |
| `label`          | `string`                         | Yes      |
| `description`    | `ReactNode`                      | No       |
| `getOptionLabel` | `(key: boolean) => string`       | No       |
| `FieldComponent` | `ComponentType<RadioGroupProps>` | No       |

**Conditional availability:** This field is `undefined` when `data.showStateWc` is `false` (the employee's active work address is not in WA).

```tsx
{
  Fields.StateWcCovered && (
    <Fields.StateWcCovered
      label="Workers' compensation coverage"
      description="Indicate if this employee is covered."
      getOptionLabel={key => (key ? 'Yes, covered' : 'No, not covered')}
    />
  )
}
```

---

### Fields.StateWcClassCode

Select dropdown for Washington state workers' compensation risk class code.

| Prop                 | Type                         | Required |
| -------------------- | ---------------------------- | -------- |
| `label`              | `string`                     | Yes      |
| `description`        | `ReactNode`                  | No       |
| `validationMessages` | `{ REQUIRED: string }`       | No       |
| `FieldComponent`     | `ComponentType<SelectProps>` | No       |

**Options:** Populated from Washington state risk class codes.

**Conditional availability:** This field is `undefined` when `data.showStateWc` is `false` or when `stateWcCovered` is `false`. Required whenever rendered (the schema enforces this independently of `optionalFieldsToRequire`).

```tsx
{
  Fields.StateWcClassCode && (
    <Fields.StateWcClassCode
      label="Risk class code"
      validationMessages={{ REQUIRED: 'Please select a risk class code' }}
    />
  )
}
```

---

## useCurrentJobForm

A wrapper hook that resolves the employee's **primary** job and threads its UUID into `useJobForm`. Mirrors `useCurrentHomeAddressForm` / `useCurrentWorkAddressForm`. Use this when your screen is "edit the current job" without picking a specific record. For secondary or future jobs, use the core `useJobForm` directly with an explicit `jobId`.

```tsx
import { useCurrentJobForm } from '@gusto/embedded-react-sdk'

function CurrentJobEditPage({ employeeId }: { employeeId: string }) {
  const job = useCurrentJobForm({ employeeId })
  // ... renders form against the primary job
}
```

Props are `Omit<UseJobFormProps, 'jobId'>`. When the employee has no jobs, the hook lands in **create** mode automatically.

---

## Usage example

```tsx
import { useJobForm, SDKFormProvider, type UseJobFormReady } from '@gusto/embedded-react-sdk'

function JobPage({ employeeId, jobId }: { employeeId: string; jobId?: string }) {
  const job = useJobForm({ employeeId, jobId })

  if (job.isLoading) return <div>Loading...</div>

  return <JobFormReady job={job} />
}

function JobFormReady({ job }: { job: UseJobFormReady }) {
  const { Fields } = job.form

  return (
    <SDKFormProvider formHookResult={job}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await job.actions.onSubmit()
        }}
      >
        <Fields.Title
          label="Job title"
          validationMessages={{ REQUIRED: 'Job title is required' }}
        />
        <Fields.HireDate
          label="Hire date"
          validationMessages={{ REQUIRED: 'Hire date is required' }}
        />

        {Fields.TwoPercentShareholder && (
          <Fields.TwoPercentShareholder label="Employee is a 2% shareholder" />
        )}

        {Fields.StateWcCovered && <Fields.StateWcCovered label="Workers' compensation coverage" />}

        {Fields.StateWcClassCode && (
          <Fields.StateWcClassCode
            label="Risk class code"
            validationMessages={{ REQUIRED: 'Please select a risk class code' }}
          />
        )}

        <button type="submit" disabled={job.status.isPending}>
          {job.status.mode === 'create' ? 'Add job' : 'Save job'}
        </button>
      </form>
    </SDKFormProvider>
  )
}
```

---

## Related

- [useCompensationForm](./useCompensationForm.md) — pair this with `useJobForm` for full job + compensation editing.
- [Composing Multiple Hooks](./hooks.md#composing-multiple-hooks) — coordinate `useJobForm` + `useCompensationForm` (and others) on a single screen.
- [Composing Job + Compensation](./hooks.md#composing-job--compensation) — onboarding stub-fill and steady-state edit recipes.
