import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeeEmploymentsCreateRehireMutation } from '@gusto/embedded-api/react-query/employeeEmploymentsCreateRehire'
import { RehireEmployeePresentation } from './RehireEmployeePresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import { formatDateToStringDate } from '@/helpers/dateFormatting'

/**
 * Props for {@link RehireEmployee}.
 *
 * @public
 */
export interface RehireEmployeeProps extends BaseComponentInterface<'Employee.Management.Rehire'> {
  /** The identifier of the terminated employee to rehire. */
  employeeId: string
  /** The associated company identifier. */
  companyId: string
}

/**
 * Form values collected by {@link RehireEmployee}.
 *
 * @public
 */
export interface RehireEmployeeFormData {
  /** The day the employee returns to work. */
  effectiveDate: Date
  /** The UUID of the company location where the employee will report to work. */
  workLocationUuid: string
  /** Whether Gusto should file a new hire report for the employee. */
  fileNewHireReport: 'yes' | 'no'
}

/**
 * Standalone form for scheduling the rehire of a terminated employee — sets the return-to-work date,
 * confirms the work address, and chooses whether to file a new hire report.
 *
 * @remarks
 * Rendered inside {@link EmployeeListFlow} when the user selects "Rehire" on a dismissed employee
 * row. Submitting schedules the rehire and returns the user to the employee list.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/rehire/scheduled` | Fired after a rehire is successfully scheduled. | `{ employeeId: string, effectiveDate: string }` |
 * | `employee/rehire/cancelled` | Fired when the user clicks Cancel. | `{ employeeId: string }` |
 *
 * @param props - See {@link RehireEmployeeProps}.
 * @returns The rehire form.
 * @public
 * @group Block components
 *
 * @example
 * ```tsx
 * import { EmployeeManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <EmployeeManagement.RehireEmployee
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function RehireEmployee(props: RehireEmployeeProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ employeeId, companyId, dictionary }: RehireEmployeeProps) => {
  useComponentDictionary('Employee.Management.Rehire', dictionary)
  useI18n('Employee.Management.Rehire')

  const { onEvent, baseSubmitHandler } = useBase()

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })

  const { data: locationsData } = useLocationsGetSuspense({ companyId })

  const { mutateAsync: createRehire, isPending } = useEmployeeEmploymentsCreateRehireMutation()

  const workLocations = (locationsData.companyLocationsList ?? []).filter(
    location => location.active !== false,
  )

  const employeeName = firstLastName({
    first_name: employee?.firstName,
    last_name: employee?.lastName,
  })

  const handleSubmit = async (formData: RehireEmployeeFormData) => {
    const effectiveDate = formatDateToStringDate(formData.effectiveDate)!

    await baseSubmitHandler(formData, async () => {
      await createRehire({
        request: {
          employeeId,
          rehireBody: {
            effectiveDate,
            workLocationUuid: formData.workLocationUuid,
            fileNewHireReport: formData.fileNewHireReport === 'yes',
          },
        },
      })

      onEvent(componentEvents.EMPLOYEE_REHIRE_SCHEDULED, {
        employeeId,
        effectiveDate,
      })
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_REHIRE_CANCELLED, { employeeId })
  }

  return (
    <RehireEmployeePresentation
      employeeName={employeeName}
      workLocations={workLocations}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isPending}
    />
  )
}
