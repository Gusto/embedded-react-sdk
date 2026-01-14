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
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Department } from '@gusto/embedded-api/models/components/department'
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
  // Full lists for grouping in review (used for by_department type)
  departmentsList?: Department[]
  employeesList?: Employee[]
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
    return paySchedules.map(ps => ({
      value: ps.uuid,
      label: `${ps.frequency}${ps.customName ? ` - ${ps.customName}` : ''}`,
    }))
  }, [paySchedules])

  const fallbackSchedule = paySchedules[0]?.uuid ?? ''

  // Build a map of department -> schedule for by_department type
  const departmentScheduleMap = useMemo(() => {
    const map = new Map<string, string>()
    if (currentAssignment?.departments) {
      currentAssignment.departments.forEach(d => {
        if (d.departmentUuid && d.payScheduleUuid) {
          map.set(d.departmentUuid, d.payScheduleUuid)
        }
      })
    }
    return map
  }, [currentAssignment?.departments])

  // Build a map of employee -> schedule for by_employee type
  const employeeScheduleMap = useMemo(() => {
    const map = new Map<string, string>()
    if (currentAssignment?.employees) {
      currentAssignment.employees.forEach(e => {
        if (e.employeeUuid && e.payScheduleUuid) {
          map.set(e.employeeUuid, e.payScheduleUuid)
        }
      })
    }
    return map
  }, [currentAssignment?.employees])

  // Helper to get an employee's current schedule based on current assignment type
  const getEmployeeCurrentSchedule = (employee: Employee): string => {
    const currentType = currentAssignment?.type

    if (currentType === PayScheduleAssignmentBodyType.Single) {
      return currentAssignment?.defaultPayScheduleUuid ?? fallbackSchedule
    }

    if (currentType === PayScheduleAssignmentBodyType.HourlySalaried) {
      const flsaStatus = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
      const isHourly = flsaStatus === 'Nonexempt'
      return isHourly
        ? (currentAssignment?.hourlyPayScheduleUuid ?? fallbackSchedule)
        : (currentAssignment?.salariedPayScheduleUuid ?? fallbackSchedule)
    }

    if (currentType === PayScheduleAssignmentBodyType.ByDepartment) {
      const deptUuid = employee.departmentUuid
      if (deptUuid && departmentScheduleMap.has(deptUuid)) {
        return departmentScheduleMap.get(deptUuid) ?? fallbackSchedule
      }
      // Uncategorized employees use default
      return currentAssignment?.defaultPayScheduleUuid ?? fallbackSchedule
    }

    if (currentType === PayScheduleAssignmentBodyType.ByEmployee) {
      if (employee.uuid && employeeScheduleMap.has(employee.uuid)) {
        return employeeScheduleMap.get(employee.uuid) ?? fallbackSchedule
      }
    }

    return fallbackSchedule
  }

  // For "single" type dropdown, use defaultPayScheduleUuid from current assignment
  const currentDefaultSchedule = currentAssignment?.defaultPayScheduleUuid ?? fallbackSchedule

  const [defaultPayScheduleUuid, setDefaultPayScheduleUuid] =
    useState<string>(currentDefaultSchedule)

  // For hourly/salaried, use specific UUIDs if current type is hourly_salaried,
  // otherwise fall back to defaultPayScheduleUuid (so user sees the schedule employees are actually on)
  const [hourlyPayScheduleUuid, setHourlyPayScheduleUuid] = useState<string>(
    currentAssignment?.hourlyPayScheduleUuid ?? currentDefaultSchedule,
  )

  const [salariedPayScheduleUuid, setSalariedPayScheduleUuid] = useState<string>(
    currentAssignment?.salariedPayScheduleUuid ?? currentDefaultSchedule,
  )

  const assignableEmployees = employees.filter(
    e =>
      !e.terminated &&
      !e.historical &&
      e.onboarded &&
      e.jobs &&
      e.jobs.length > 0 &&
      e.jobs[0]?.compensations?.length,
  )

  const [employeeAssignments, setEmployeeAssignments] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    // Initialize each employee to their ACTUAL current schedule based on current assignment type
    assignableEmployees.forEach(e => {
      if (e.uuid) {
        map.set(e.uuid, getEmployeeCurrentSchedule(e))
      }
    })
    return map
  })

  const [departmentAssignments, setDepartmentAssignments] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>()
    // First, populate from current assignment's departments
    if (currentAssignment?.departments) {
      currentAssignment.departments.forEach(d => {
        if (d.departmentUuid && d.payScheduleUuid) {
          map.set(d.departmentUuid, d.payScheduleUuid)
        }
      })
    }
    // For departments not in current assignment, use the default schedule
    for (const d of departments) {
      if (d.uuid && !map.has(d.uuid)) {
        map.set(d.uuid, currentAssignment?.defaultPayScheduleUuid ?? fallbackSchedule)
      }
    }
    return map
  })

  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setUserHasInteracted(true)
    setter(value)
  }

  const [userHasInteracted, setUserHasInteracted] = useState(false)

  const hasChanges = useMemo(() => {
    if (!userHasInteracted) {
      return false
    }

    const currentType = currentAssignment?.type

    if (assignmentType !== currentType) {
      return true
    }

    if (!currentAssignment) {
      return true
    }

    switch (assignmentType) {
      case PayScheduleAssignmentBodyType.Single:
        return defaultPayScheduleUuid !== currentAssignment.defaultPayScheduleUuid

      case PayScheduleAssignmentBodyType.HourlySalaried:
        return (
          hourlyPayScheduleUuid !== currentAssignment.hourlyPayScheduleUuid ||
          salariedPayScheduleUuid !== currentAssignment.salariedPayScheduleUuid
        )

      case PayScheduleAssignmentBodyType.ByEmployee: {
        const currentEmployeeMap = new Map<string, string>()
        if (currentAssignment.employees) {
          for (const e of currentAssignment.employees) {
            if (e.employeeUuid && e.payScheduleUuid) {
              currentEmployeeMap.set(e.employeeUuid, e.payScheduleUuid)
            }
          }
        }

        for (const [employeeUuid, payScheduleUuid] of employeeAssignments) {
          if (currentEmployeeMap.get(employeeUuid) !== payScheduleUuid) {
            return true
          }
        }
        return false
      }

      case PayScheduleAssignmentBodyType.ByDepartment: {
        if (defaultPayScheduleUuid !== currentAssignment.defaultPayScheduleUuid) {
          return true
        }

        const currentDeptMap = new Map<string, string>()
        if (currentAssignment.departments) {
          for (const d of currentAssignment.departments) {
            if (d.departmentUuid && d.payScheduleUuid) {
              currentDeptMap.set(d.departmentUuid, d.payScheduleUuid)
            }
          }
        }

        for (const [deptUuid, payScheduleUuid] of departmentAssignments) {
          if (currentDeptMap.get(deptUuid) !== payScheduleUuid) {
            return true
          }
        }
        return false
      }

      default:
        return true
    }
  }, [
    userHasInteracted,
    assignmentType,
    currentAssignment,
    defaultPayScheduleUuid,
    hourlyPayScheduleUuid,
    salariedPayScheduleUuid,
    employeeAssignments,
    departmentAssignments,
  ])

  const handleEmployeeAssignmentChange = (employeeUuid: string, value: string) => {
    setUserHasInteracted(true)
    setEmployeeAssignments(prev => {
      const next = new Map(prev)
      next.set(employeeUuid, value)
      return next
    })
  }

  const handleCreateNew = () => {
    onEvent(componentEvents.MANAGE_PAY_SCHEDULE_CREATE_NEW, { returnContext: 'header' })
  }

  const handleDepartmentAssignmentChange = (departmentUuid: string, value: string) => {
    setUserHasInteracted(true)
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
      case PayScheduleAssignmentBodyType.ByEmployee: {
        const validEmployeeUuids = new Set(assignableEmployees.map(e => e.uuid))
        assignmentData.employees = Array.from(employeeAssignments.entries())
          .filter(([employeeUuid]) => validEmployeeUuids.has(employeeUuid))
          .map(([employeeUuid, payScheduleUuid]) => ({ employeeUuid, payScheduleUuid }))
        break
      }
      case PayScheduleAssignmentBodyType.ByDepartment:
        assignmentData.defaultPayScheduleUuid = defaultPayScheduleUuid
        assignmentData.departments = Array.from(departmentAssignments.entries()).map(
          ([departmentUuid, payScheduleUuid]) => ({ departmentUuid, payScheduleUuid }),
        )
        assignmentData.departmentsList = departments
        assignmentData.employeesList = employees
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
      employees={assignableEmployees}
      departments={departments}
      defaultPayScheduleUuid={defaultPayScheduleUuid}
      hourlyPayScheduleUuid={hourlyPayScheduleUuid}
      salariedPayScheduleUuid={salariedPayScheduleUuid}
      employeeAssignments={employeeAssignments}
      departmentAssignments={departmentAssignments}
      onDefaultChange={value => {
        handleSelectChange(value, setDefaultPayScheduleUuid)
      }}
      onHourlyChange={value => {
        handleSelectChange(value, setHourlyPayScheduleUuid)
      }}
      onSalariedChange={value => {
        handleSelectChange(value, setSalariedPayScheduleUuid)
      }}
      onEmployeeAssignmentChange={handleEmployeeAssignmentChange}
      onDepartmentAssignmentChange={handleDepartmentAssignmentChange}
      onCreateNew={handleCreateNew}
      onContinue={handleContinue}
      onBack={handleBack}
      hasChanges={hasChanges}
    />
  )
}
