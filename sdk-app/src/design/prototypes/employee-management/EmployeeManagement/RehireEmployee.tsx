import { Suspense, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2026-02-01/models/errors/unprocessableentityerror'
import type { EntityErrorObject } from '@gusto/embedded-api-v-2026-02-01/models/components/entityerrorobject'
import { useEmployeesGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import { useLocationsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/locationsGet'
import { useEmployeeEmploymentsGetRehire } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeEmploymentsGetRehire'
import { useEmployeeEmploymentsCreateRehireMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeEmploymentsCreateRehire'
import { useEmployeeEmploymentsRehireMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeEmploymentsRehire'
import { RehireBodyEmploymentStatus } from '@gusto/embedded-api-v-2026-02-01/models/components/rehirebody'
import type { EntityIds } from '../../../../useEntities'
import {
  RehireEmployeeForm,
  type RehireEmployeeFormValues,
} from '../../../components/employee/management/RehireEmployeeForm/RehireEmployeeForm'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'

function flattenErrors(errors: EntityErrorObject[]): EntityErrorObject[] {
  const flat: EntityErrorObject[] = []
  for (const error of errors) {
    if (error.category === 'nested_errors' && Array.isArray(error.errors)) {
      flat.push(...flattenErrors(error.errors))
    } else {
      flat.push(error)
    }
  }
  return flat
}

interface SubmitError {
  effectiveDateError?: string
  generalError?: string
}

function classifySubmitError(error: unknown): SubmitError {
  if (error instanceof UnprocessableEntityError) {
    const flat = flattenErrors(error.errors)
    const result: SubmitError = {}
    const generalMessages: string[] = []

    for (const entry of flat) {
      const message = entry.message ?? ''
      const isHireDateRule =
        (entry.errorKey === 'hired_at' || entry.errorKey === 'effective_date') &&
        /work employee addresses history/i.test(message)

      if (isHireDateRule) {
        const dateMatch = message.match(/(\d{2}\/\d{2}\/\d{4})/)
        result.effectiveDateError = dateMatch
          ? `This rehire date isn't compatible with this employee's employment history. Try a date on or before ${dateMatch[1]}.`
          : "This rehire date isn't compatible with this employee's employment history."
      } else if (message) {
        generalMessages.push(message)
      }
    }

    if (generalMessages.length > 0) result.generalError = generalMessages.join(' ')
    if (result.effectiveDateError || result.generalError) return result
  }
  if (error instanceof Error && error.message) return { generalError: error.message }
  return { generalError: 'Something went wrong. Please try again.' }
}

function RehireEmployeeContent() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const { employeeId } = useParams<{ employeeId: string }>()
  const navigate = useNavigate()
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [effectiveDateError, setEffectiveDateError] = useState<string | null>(null)

  const { data: employeeData } = useEmployeesGetSuspense({ employeeId: employeeId! })
  const employee = employeeData.employee

  const { data: locationsData } = useLocationsGetSuspense({ companyId: entities.companyId })
  const workLocations = (locationsData.companyLocationsList ?? []).filter(
    location => location.active !== false,
  )

  const { data: rehireData, isPending: isLoadingRehire } = useEmployeeEmploymentsGetRehire(
    { employeeId: employeeId! },
    { throwOnError: () => false, retry: false },
  )

  const rehire = rehireData?.rehire
  const isPendingRehire = (() => {
    if (!rehire?.version || !rehire.effectiveDate) return false
    const effective = new Date(`${rehire.effectiveDate}T00:00:00`)
    if (Number.isNaN(effective.getTime())) return false
    return effective.getTime() > Date.now()
  })()
  const existingRehire = isPendingRehire ? rehire : null

  const { mutateAsync: createRehire, isPending: isCreating } =
    useEmployeeEmploymentsCreateRehireMutation()
  const { mutateAsync: updateRehire, isPending: isUpdating } =
    useEmployeeEmploymentsRehireMutation()

  if (!employee) return null
  if (isLoadingRehire) return null

  const handleSubmit = async (values: RehireEmployeeFormValues) => {
    setGeneralError(null)
    setEffectiveDateError(null)
    const isUpdate = !!existingRehire?.version
    try {
      if (existingRehire?.version) {
        await updateRehire({
          request: {
            employeeId: employee.uuid,
            rehireUpdateRequestBody: {
              version: existingRehire.version,
              effectiveDate: values.effectiveDate,
              workLocationUuid: values.workLocationUuid,
              fileNewHireReport: values.fileNewHireReport,
            },
          },
        })
      } else {
        await createRehire({
          request: {
            employeeId: employee.uuid,
            rehireBody: {
              effectiveDate: values.effectiveDate,
              workLocationUuid: values.workLocationUuid,
              fileNewHireReport: values.fileNewHireReport,
              employmentStatus: RehireBodyEmploymentStatus.FullTime,
            },
          },
        })
      }
    } catch (error) {
      const classified = classifySubmitError(error)
      if (classified.effectiveDateError) setEffectiveDateError(classified.effectiveDateError)
      if (classified.generalError) setGeneralError(classified.generalError)
      return
    }
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ') || 'employee'
    const message = isUpdate ? `Rehire updated for ${name}` : `Rehire scheduled for ${name}`
    void navigate(`..?success=${encodeURIComponent(message)}`, { replace: true })
  }

  return (
    <RehireEmployeeForm
      employee={employee}
      workLocations={workLocations}
      isPending={isCreating || isUpdating}
      existingRehire={existingRehire}
      submitError={generalError}
      effectiveDateError={effectiveDateError}
      onDismissSubmitError={() => {
        setGeneralError(null)
      }}
      onDismissEffectiveDateError={() => {
        setEffectiveDateError(null)
      }}
      onCancel={() => {
        void navigate('..')
      }}
      onSubmit={handleSubmit}
    />
  )
}

export function RehireEmployee() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Suspense
        fallback={
          <Flex flexDirection="column" gap={24}>
            Loading…
          </Flex>
        }
      >
        <RehireEmployeeContent />
      </Suspense>
    </BaseComponent>
  )
}
