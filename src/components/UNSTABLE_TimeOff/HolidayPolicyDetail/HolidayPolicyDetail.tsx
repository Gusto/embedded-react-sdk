import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  useHolidayPayPoliciesGetSuspense,
  invalidateAllHolidayPayPoliciesGet,
} from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { useHolidayPayPoliciesRemoveEmployeesMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesRemoveEmployees'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { getDefaultHolidayItems } from '../shared/holidayHelpers'
import { HolidayPolicyDetailPresentation } from './HolidayPolicyDetailPresentation'
import type { HolidayPolicyDetailEmployee } from './HolidayPolicyDetailTypes'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

export interface HolidayPolicyDetailProps extends BaseComponentInterface {
  companyId: string
  defaultTab?: 'holidays' | 'employees'
}

export function HolidayPolicyDetail(props: HolidayPolicyDetailProps) {
  return (
    <BaseComponent componentName="Company.TimeOff.HolidayPolicy" {...props}>
      <Root companyId={props.companyId} defaultTab={props.defaultTab} />
    </BaseComponent>
  )
}

interface RemoveDialogTarget {
  uuid: string
  name: string
}

function Root({
  companyId,
  defaultTab = 'holidays',
}: Pick<HolidayPolicyDetailProps, 'companyId' | 'defaultTab'>) {
  useI18n('Company.TimeOff.HolidayPolicy')
  useI18n('Company.TimeOff.PolicyDetail')
  const { t } = useTranslation('Company.TimeOff.HolidayPolicy')
  const { t: tShared } = useTranslation('Company.TimeOff.PolicyDetail')
  const { Button } = useComponentContext()
  const queryClient = useQueryClient()
  const { onEvent, baseSubmitHandler } = useBase()

  const [selectedTabId, setSelectedTabId] = useState<string>(defaultTab)
  const [searchValue, setSearchValue] = useState('')
  const [successAlert, setSuccessAlert] = useState<string | null>(null)
  const [removeDialogTarget, setRemoveDialogTarget] = useState<RemoveDialogTarget | null>(null)

  const holidayQuery = useHolidayPayPoliciesGetSuspense({ companyUuid: companyId })
  const holidayPayPolicy = holidayQuery.data.holidayPayPolicy!

  const { data: employeesData } = useEmployeesListSuspense({
    companyId,
    terminated: false,
  })

  const removeEmployeesMutation = useHolidayPayPoliciesRemoveEmployeesMutation()

  const holidays = useMemo(() => getDefaultHolidayItems(t), [t])

  const policyEmployeeUuids = useMemo(
    () => new Set(holidayPayPolicy.employees.map(e => e.uuid)),
    [holidayPayPolicy.employees],
  )

  const employees: HolidayPolicyDetailEmployee[] = useMemo(() => {
    const allEmployees = employeesData.showEmployees ?? []
    return allEmployees
      .filter(emp => policyEmployeeUuids.has(emp.uuid))
      .map(emp => ({
        uuid: emp.uuid,
        firstName: emp.firstName,
        lastName: emp.lastName,
        jobTitle: emp.title ?? null,
      }))
  }, [employeesData.showEmployees, policyEmployeeUuids])

  const filteredEmployees = useMemo(() => {
    if (!searchValue) return employees
    const query = searchValue.toLowerCase()
    return employees.filter(emp => {
      const name = firstLastName({
        first_name: emp.firstName,
        last_name: emp.lastName,
      }).toLowerCase()
      return name.includes(query)
    })
  }, [employees, searchValue])

  const handleRemoveEmployee = async () => {
    if (!removeDialogTarget) return

    const targetUuid = removeDialogTarget.uuid
    const targetName = removeDialogTarget.name
    setRemoveDialogTarget(null)

    await baseSubmitHandler({}, async () => {
      await removeEmployeesMutation.mutateAsync({
        request: {
          companyUuid: companyId,
          requestBody: {
            version: holidayPayPolicy.version!,
            employees: [{ uuid: targetUuid }],
          },
        },
      })
      await invalidateAllHolidayPayPoliciesGet(queryClient)
      setSuccessAlert(t('flash.employeeRemoved', { name: targetName }))
    })
  }

  const handleBack = () => {
    onEvent(componentEvents.TIME_OFF_BACK_TO_LIST)
  }

  const handleAddEmployees = () => {
    onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
  }

  const handleEditPolicy = () => {
    onEvent(componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE)
  }

  const actions = (
    <>
      <Button variant="secondary" onClick={handleAddEmployees}>
        {t('show.addEmployeesCta')}
      </Button>
      <Button variant="secondary" onClick={handleEditPolicy}>
        {t('show.editPolicyCta')}
      </Button>
    </>
  )

  return (
    <HolidayPolicyDetailPresentation
      title={t('show.title')}
      onBack={handleBack}
      backLabel={tShared('backLabel')}
      actions={actions}
      holidays={holidays}
      selectedTabId={selectedTabId}
      onTabChange={setSelectedTabId}
      employees={{
        data: filteredEmployees,
        searchValue,
        onSearchChange: setSearchValue,
        onSearchClear: () => {
          setSearchValue('')
        },
        itemMenu: employee => (
          <HamburgerMenu
            items={[
              {
                label: tShared('removeEmployeeDialog.confirmCta'),
                icon: <TrashCanSvg aria-hidden />,
                onClick: () => {
                  setRemoveDialogTarget({
                    uuid: employee.uuid,
                    name: firstLastName({
                      first_name: employee.firstName,
                      last_name: employee.lastName,
                    }),
                  })
                },
              },
            ]}
            triggerLabel={`Actions for ${firstLastName({ first_name: employee.firstName, last_name: employee.lastName })}`}
          />
        ),
      }}
      removeDialog={{
        isOpen: removeDialogTarget !== null,
        employeeName: removeDialogTarget?.name ?? '',
        onConfirm: handleRemoveEmployee,
        onClose: () => {
          setRemoveDialogTarget(null)
        },
        isPending: removeEmployeesMutation.isPending,
      }}
      successAlert={successAlert ?? undefined}
      onDismissAlert={() => {
        setSuccessAlert(null)
      }}
    />
  )
}
