import { useCallback, useMemo, useState } from 'react'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeAddressesDeleteWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesDeleteWorkAddress'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { WorkAddressView } from './WorkAddressView'
import { useWorkAddressForm } from '@/components/Employee/Profile/shared/useWorkAddressForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useI18n, useComponentDictionary } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { normalizeToSDKError, SDKInternalError } from '@/types/sdkError'
import { componentEvents } from '@/shared/constants'

export interface WorkAddressProps extends CommonComponentInterface<'Employee.WorkAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function WorkAddressRoot({ employeeId, dictionary, onEvent }: WorkAddressProps) {
  useI18n(['Employee.WorkAddress.Management'])
  useComponentDictionary('Employee.WorkAddress.Management', dictionary)

  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.WorkAddress.Management')
  const deleteWorkAddressMutation = useEmployeeAddressesDeleteWorkAddressMutation()
  const [editTargetUuid, setEditTargetUuid] = useState<string | undefined>(undefined)
  const [formSessionId, setFormSessionId] = useState(0)
  const beginAddressModalSession = useCallback(() => {
    setFormSessionId(n => n + 1)
  }, [])

  const employeeQuery = useEmployeesGet({ employeeId }, { enabled: !!employeeId })
  const companyId = employeeQuery.data?.employee?.companyUuid

  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { enabled: !!employeeId && !!companyId },
  )

  const activeWorkAddressUuid = useMemo(() => {
    const list = workAddressesQuery.data?.employeeWorkAddressesList
    if (!list?.length) {
      return undefined
    }
    return list.find(w => w.active)?.uuid ?? list[0]?.uuid
  }, [workAddressesQuery.data?.employeeWorkAddressesList])

  const workAddressUuidForEdit = editTargetUuid ?? activeWorkAddressUuid

  const editInactiveRow = useMemo(() => {
    if (!editTargetUuid || !workAddressesQuery.data?.employeeWorkAddressesList) {
      return undefined
    }
    return workAddressesQuery.data.employeeWorkAddressesList.find(w => w.uuid === editTargetUuid)
  }, [editTargetUuid, workAddressesQuery.data?.employeeWorkAddressesList])

  const withEffectiveDateOnEdit = editInactiveRow ? editInactiveRow.active !== true : false

  const employeeDisplayName = useMemo(() => {
    const employee = employeeQuery.data?.employee
    if (!employee) {
      return ''
    }
    return firstLastName({
      first_name: employee.firstName,
      last_name: employee.lastName,
    }).trim()
  }, [employeeQuery.data?.employee])

  const editWorkAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    workAddressUuid: workAddressUuidForEdit,
    withEffectiveDateField: withEffectiveDateOnEdit,
    formSessionId,
  })

  const changeWorkAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    withEffectiveDateField: true,
    formSessionId,
  })

  const errorHandling = composeErrorHandler(
    [employeeQuery, workAddressesQuery, editWorkAddressForm, changeWorkAddressForm],
    { submitError: rootSubmitError, setSubmitError: setRootSubmitError },
  )

  const handleWorkAddressSaved = (result: HookSubmitResult<EmployeeWorkAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, result.data)
    }
  }

  const handleConfirmDelete = async (workAddressUuid: string): Promise<boolean> => {
    if (editWorkAddressForm.isLoading || changeWorkAddressForm.isLoading) {
      return false
    }
    const snapshot =
      editWorkAddressForm.data.workAddresses?.find(w => w.uuid === workAddressUuid) ??
      changeWorkAddressForm.data.workAddresses?.find(w => w.uuid === workAddressUuid)

    let succeeded = false
    await baseSubmitHandler(
      { workAddressUuid, snapshot },
      async ({ workAddressUuid: uuid, snapshot: snap }) => {
        await deleteWorkAddressMutation.mutateAsync({
          request: { workAddressUuid: uuid },
        })
        succeeded = true
        if (snap) {
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_DELETED, snap)
        }
      },
    )
    return succeeded
  }

  if (employeeQuery.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  if (employeeQuery.isError) {
    return <BaseLayout error={errorHandling.errors} />
  }

  if (employeeQuery.data?.employee && !employeeQuery.data.employee.companyUuid) {
    return (
      <BaseLayout
        error={normalizeToSDKError(
          new SDKInternalError(
            'Employee record is missing companyUuid, which is required to load work address locations.',
          ),
        )}
      />
    )
  }

  if (editWorkAddressForm.isLoading || changeWorkAddressForm.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  return (
    <BaseLayout error={errorHandling.errors}>
      <WorkAddressView
        editWorkAddressForm={editWorkAddressForm}
        changeWorkAddressForm={changeWorkAddressForm}
        editTargetUuid={editTargetUuid}
        onEditTargetUuidChange={setEditTargetUuid}
        onBeginAddressModalSession={beginAddressModalSession}
        employeeDisplayName={employeeDisplayName}
        onConfirmDelete={handleConfirmDelete}
        onWorkAddressSaved={handleWorkAddressSaved}
        isDeletePending={deleteWorkAddressMutation.isPending}
      />
    </BaseLayout>
  )
}

export function WorkAddress({
  FallbackComponent,
  ...props
}: WorkAddressProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      componentName="Employee.WorkAddress.Management"
      FallbackComponent={FallbackComponent}
    >
      <WorkAddressRoot {...props} />
    </BaseBoundaries>
  )
}
