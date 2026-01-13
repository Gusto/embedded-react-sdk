import { useState, useMemo } from 'react'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import { useDepartmentsGetAllSuspense } from '@gusto/embedded-api/react-query/departmentsGetAll'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import {
  PayScheduleAssignmentBodyType,
  type Employees as EmployeeAssignment,
  type Departments as DepartmentAssignment,
} from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ManagePayScheduleAssignmentPresentation } from './ManagePayScheduleAssignmentPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type PayScheduleType =
  (typeof PayScheduleAssignmentBodyType)[keyof typeof PayScheduleAssignmentBodyType]

export interface AssignmentData {
  type: PayScheduleType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  employees?: EmployeeAssignment[]
  departments?: DepartmentAssignment[]
}

export interface ManagePayScheduleAssignmentProps extends BaseComponentInterface {
  companyId: string
  assignmentType: PayScheduleType
}

export function ManagePayScheduleAssignment(props: ManagePayScheduleAssignmentProps) {
  useI18n('CompanyManagement.ManagePayScheduleAssignment')
  useComponentDictionary('CompanyManagement.ManagePayScheduleAssignment', props.dictionary)
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const CREATE_NEW_VALUE = '__CREATE_NEW__'

function Root({ companyId, assignmentType }: ManagePayScheduleAssignmentProps) {
  const { onEvent } = useBase()

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })
  const { data: assignmentsData } = usePaySchedulesGetAssignmentsSuspense({ companyId })
  const { data: departmentsData } = useDepartmentsGetAllSuspense({ companyUuid: companyId })
  const { data: employeesData } = useEmployeesListSuspense({ companyId })

  const paySchedules = paySchedulesData.payScheduleList ?? []
  const currentAssignment = assignmentsData.payScheduleAssignment
  const departments = departmentsData.departmentList ?? []
  const employees = employeesData.showEmployees ?? []

  const payScheduleOptions = useMemo(() => {
    const options = paySchedules.map(ps => ({
      value: ps.uuid,
      label: `${ps.frequency}${ps.customName ? ` - ${ps.customName}` : ''}`,
    }))
    return [{ value: CREATE_NEW_VALUE, label: '+ Add new pay schedule' }, ...options]
  }, [paySchedules])

  const [defaultPayScheduleUuid, setDefaultPayScheduleUuid] = useState<string>(
    currentAssignment?.defaultPayScheduleUuid ?? paySchedules[0]?.uuid ?? '',
  )

  const [hourlyPayScheduleUuid, setHourlyPayScheduleUuid] = useState<string>(
    currentAssignment?.hourlyPayScheduleUuid ?? paySchedules[0]?.uuid ?? '',
  )

  const [salariedPayScheduleUuid, setSalariedPayScheduleUuid] = useState<string>(
    currentAssignment?.salariedPayScheduleUuid ?? paySchedules[0]?.uuid ?? '',
  )

  const [employeeAssignments, setEmployeeAssignments] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    if (currentAssignment?.employees) {
      currentAssignment.employees.forEach(e => {
        if (e.employeeUuid && e.payScheduleUuid) {
          map.set(e.employeeUuid, e.payScheduleUuid)
        }
      })
    }
    employees.forEach(e => {
      if (e.uuid && !map.has(e.uuid)) {
        map.set(e.uuid, paySchedules[0]?.uuid ?? '')
      }
    })
    return map
  })

  const [departmentAssignments, setDepartmentAssignments] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    if (currentAssignment?.departments) {
      currentAssignment.departments.forEach(d => {
        if (d.departmentUuid && d.payScheduleUuid) {
          map.set(d.departmentUuid, d.payScheduleUuid)
        }
      })
    }
    for (const d of departments) {
      if (d.uuid && !map.has(d.uuid)) {
        map.set(d.uuid, paySchedules[0]?.uuid ?? '')
      }
    }
    return map
  })

  const handleSelectChange = (
    value: string,
    setter: (value: string) => void,
    fieldContext?: string,
  ) => {
    if (value === CREATE_NEW_VALUE) {
      onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW, { returnContext: fieldContext })
      return
    }
    setter(value)
  }

  const handleEmployeeAssignmentChange = (employeeUuid: string, value: string) => {
    if (value === CREATE_NEW_VALUE) {
      onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW, {
        returnContext: `employee:${employeeUuid}`,
      })
      return
    }
    setEmployeeAssignments(prev => {
      const next = new Map(prev)
      next.set(employeeUuid, value)
      return next
    })
  }

  const handleDepartmentAssignmentChange = (departmentUuid: string, value: string) => {
    if (value === CREATE_NEW_VALUE) {
      onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW, {
        returnContext: `department:${departmentUuid}`,
      })
      return
    }
    setDepartmentAssignments(prev => {
      const next = new Map(prev)
      next.set(departmentUuid, value)
      return next
    })
  }

  const handleContinue = () => {
    const assignmentData: AssignmentData = {
      type: assignmentType,
    }

    switch (assignmentType) {
      case PayScheduleAssignmentBodyType.Single:
        assignmentData.defaultPayScheduleUuid = defaultPayScheduleUuid
        break
      case PayScheduleAssignmentBodyType.HourlySalaried:
        assignmentData.hourlyPayScheduleUuid = hourlyPayScheduleUuid
        assignmentData.salariedPayScheduleUuid = salariedPayScheduleUuid
        break
      case PayScheduleAssignmentBodyType.ByEmployee:
        assignmentData.employees = Array.from(employeeAssignments.entries()).map(
          ([employeeUuid, payScheduleUuid]) => ({ employeeUuid, payScheduleUuid }),
        )
        break
      case PayScheduleAssignmentBodyType.ByDepartment:
        assignmentData.defaultPayScheduleUuid = defaultPayScheduleUuid
        assignmentData.departments = Array.from(departmentAssignments.entries()).map(
          ([departmentUuid, payScheduleUuid]) => ({ departmentUuid, payScheduleUuid }),
        )
        break
    }

    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_ASSIGNMENT_CONTINUE, assignmentData)
  }

  const handleBack = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_BACK)
  }

  return (
    <ManagePayScheduleAssignmentPresentation
      assignmentType={assignmentType}
      payScheduleOptions={payScheduleOptions}
      paySchedules={paySchedules}
      employees={employees}
      departments={departments}
      defaultPayScheduleUuid={defaultPayScheduleUuid}
      hourlyPayScheduleUuid={hourlyPayScheduleUuid}
      salariedPayScheduleUuid={salariedPayScheduleUuid}
      employeeAssignments={employeeAssignments}
      departmentAssignments={departmentAssignments}
      onDefaultChange={value => {
        handleSelectChange(value, setDefaultPayScheduleUuid, 'default')
      }}
      onHourlyChange={value => {
        handleSelectChange(value, setHourlyPayScheduleUuid, 'hourly')
      }}
      onSalariedChange={value => {
        handleSelectChange(value, setSalariedPayScheduleUuid, 'salaried')
      }}
      onEmployeeAssignmentChange={handleEmployeeAssignmentChange}
      onDepartmentAssignmentChange={handleDepartmentAssignmentChange}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  )
}

export { CREATE_NEW_VALUE }
