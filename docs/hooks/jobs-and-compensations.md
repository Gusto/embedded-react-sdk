---
title: Working with Jobs and Compensations
description: Patterns for composing useJobForm and useCompensationForm on the same screen — onboarding stub-fill and steady-state edits via composeSubmitHandler.
order: 5
---

# Working with Jobs and Compensations

Jobs and compensations are separate entities in the Gusto API:

- A **job** (`POST /v1/employees/:id/jobs`, `PUT /v1/jobs/:id`) carries title, hire date, S-Corp 2% shareholder flag, and Washington state workers' comp fields. Modeled by [`useJobForm`](./useJobForm.md).
- A **compensation** (`POST /v1/jobs/:jobId/compensations`, `PUT /v1/compensations/:id`) carries FLSA status, pay rate, payment unit, and effective date. Modeled by [`useCompensationForm`](./useCompensationForm.md).

Most product flows compose both hooks on the same screen. This page covers the two patterns you'll reach for and how to wire them up with [`composeSubmitHandler`](./hooks.md#composing-multiple-hooks).

---

## Onboarding stub-fill (POST job → PUT auto-created stub)

When a job is created, the API auto-creates a stub compensation with `rate: 0`. Onboarding flows replace that stub with the real values via PUT. `useCompensationForm.actions.onSubmit` accepts `{ jobId, compensationId, compensationVersion }` for this exact case:

```tsx
import {
  useJobForm,
  useCompensationForm,
  composeSubmitHandler,
  SDKFormProvider,
} from '@gusto/embedded-react-sdk'

function OnboardingCompensationPage({ employeeId }: { employeeId: string }) {
  const jobForm = useJobForm({ employeeId, shouldFocusError: false })
  const compensationForm = useCompensationForm({ employeeId, shouldFocusError: false })

  if (jobForm.isLoading || compensationForm.isLoading) return <LoadingSpinner />

  const JobFields = jobForm.form.Fields
  const CompFields = compensationForm.form.Fields

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [jobForm, compensationForm],
    async () => {
      const jobResult = await jobForm.actions.onSubmit()
      if (!jobResult || jobResult.mode !== 'create') return

      const job = jobResult.data
      const compensationId = job.currentCompensationUuid
      const stub = job.compensations?.find(c => c.uuid === compensationId)

      await compensationForm.actions.onSubmit({
        jobId: job.uuid,
        compensationId,
        compensationVersion: stub?.version,
      })
    },
  )

  return (
    <form onSubmit={handleSubmit}>
      {errorHandling.errors.length > 0 && (
        <div role="alert">
          {errorHandling.errors.map((e, i) => (
            <p key={i}>{e.message}</p>
          ))}
        </div>
      )}

      <SDKFormProvider formHookResult={jobForm}>
        <JobFields.Title label="Job title" validationMessages={{ REQUIRED: 'Required' }} />
        <JobFields.HireDate label="Hire date" validationMessages={{ REQUIRED: 'Required' }} />
        {JobFields.TwoPercentShareholder && (
          <JobFields.TwoPercentShareholder label="2% S-Corp shareholder" />
        )}
        {JobFields.StateWcCovered && <JobFields.StateWcCovered label="WA workers' comp covered" />}
        {JobFields.StateWcClassCode && (
          <JobFields.StateWcClassCode
            label="Risk class code"
            validationMessages={{ REQUIRED: 'Required' }}
          />
        )}
      </SDKFormProvider>

      <SDKFormProvider formHookResult={compensationForm}>
        {CompFields.FlsaStatus && (
          <CompFields.FlsaStatus
            label="Employee type"
            validationMessages={{ REQUIRED: 'Required' }}
          />
        )}
        <CompFields.Rate
          label="Compensation amount"
          validationMessages={{
            REQUIRED: 'Required',
            RATE_MINIMUM: 'Must be at least $1.00',
            RATE_EXEMPT_THRESHOLD: 'Must clear the FLSA salary threshold',
          }}
        />
        <CompFields.PaymentUnit
          label="Per"
          validationMessages={{
            REQUIRED: 'Required',
            PAYMENT_UNIT_OWNER: 'Owners must use Paycheck',
            PAYMENT_UNIT_COMMISSION: 'Commission-only must use Year',
          }}
        />
        <CompFields.EffectiveDate
          label="Effective date"
          validationMessages={{
            REQUIRED: 'Required',
            EFFECTIVE_DATE_BEFORE_HIRE: 'Cannot precede hire date',
          }}
        />
        {CompFields.AdjustForMinimumWage && (
          <CompFields.AdjustForMinimumWage label="Adjust for minimum wage" />
        )}
        {CompFields.MinimumWageId && (
          <CompFields.MinimumWageId
            label="Minimum wage"
            validationMessages={{ REQUIRED: 'Required' }}
          />
        )}
      </SDKFormProvider>

      <button type="submit">Save</button>
    </form>
  )
}
```

`composeSubmitHandler` validates both forms in parallel — if either fails, the chain short-circuits before any network I/O. Inside `onAllValid`, thread the new IDs and the stub's version into `useCompensationForm` to PUT it.

### Driving hireDate / effectiveDate from external context

To submit `hireDate` and `effectiveDate` without rendering input fields for them, set `withHireDateField: false` and `withEffectiveDateField: false` and supply the values via submit options. The schemas drop those fields from validation and `Fields.HireDate` / `Fields.EffectiveDate` become `undefined`, so the TypeScript build flags any accidental renders.

```tsx
const jobForm = useJobForm({
  employeeId,
  withHireDateField: false,
  shouldFocusError: false,
})
const compensationForm = useCompensationForm({
  employeeId,
  withEffectiveDateField: false,
  shouldFocusError: false,
})

const { handleSubmit } = composeSubmitHandler([jobForm, compensationForm], async () => {
  const jobResult = await jobForm.actions.onSubmit({ employeeId, hireDate: startDate })
  if (!jobResult) return

  const job = jobResult.data
  const stub = job.compensations?.find(c => c.uuid === job.currentCompensationUuid)
  await compensationForm.actions.onSubmit({
    jobId: job.uuid,
    compensationId: job.currentCompensationUuid ?? undefined,
    compensationVersion: stub?.version,
    effectiveDate: startDate,
  })
})
```

When `withEffectiveDateField: false`, `useCompensationForm` is strictly options-only — `effective_date` is omitted from the PUT body unless you supply it via submit options. Omit `effectiveDate` from the options entirely to leave the existing date untouched.

---

## Steady-state edit (job + compensation already exist)

When both records exist (a page that edits the current compensation), pass IDs to both hooks and submit them in parallel. The hooks own their own version handling:

```tsx
function CompensationEditPage({
  employeeId,
  jobId,
  compensationId,
}: {
  employeeId: string
  jobId: string
  compensationId: string
}) {
  const jobForm = useJobForm({ employeeId, jobId, shouldFocusError: false })
  const compensationForm = useCompensationForm({
    employeeId,
    jobId,
    compensationId,
    shouldFocusError: false,
  })

  if (jobForm.isLoading || compensationForm.isLoading) return <LoadingSpinner />

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [jobForm, compensationForm],
    async () => {
      await jobForm.actions.onSubmit()
      await compensationForm.actions.onSubmit()
    },
  )

  return (
    <form onSubmit={handleSubmit}>
      {compensationForm.status.willDeleteSecondaryJobs && (
        <Alert status="warning">Saving will delete this employee's secondary jobs.</Alert>
      )}

      {/* ...fields, errorHandling banner, submit button */}
    </form>
  )
}
```

`compensationForm.status.willDeleteSecondaryJobs` is a reactive flag that flips to `true` when the form is positioned on the carve-out branch: update mode, loaded compensation is `Nonexempt`, the form's `flsaStatus` was just changed to a non-`Nonexempt` value, and the employee has at least one secondary job. While the flag is on, the hook also locks the `effectiveDate` field — it forces the form value to today and renders the field disabled (via `fieldsMetadata.effectiveDate.isDisabled`). Reverting `flsaStatus` back to `Nonexempt` restores the prior date. You can render the disabled `Fields.EffectiveDate` as-is or skip it entirely and rely on the inline warning. The hook tracks form state via `useWatch` internally — a render-time read of the flag is enough. See [derived helpers](./useCompensationForm.md#derived-helpers) for the full breakdown.
