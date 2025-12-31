import { Suspense, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetUnprocessedTerminationPeriodsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods'
import {
  useEmployeesListSuspense,
  invalidateAllEmployeesList,
} from '@gusto/embedded-api/react-query/employeesList'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import {
  ProcessingStatuses,
  PayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import { OffCycleReasonType } from '@gusto/embedded-api/models/components/offcyclereasontype'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { UnprocessedTerminationPayPeriod } from '@gusto/embedded-api/models/components/unprocessedterminationpayperiod'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollprepared'
import type { ShowEmployees } from '@gusto/embedded-api/models/components/showemployees'
import { TerminateEmployee } from './TerminateEmployee/TerminateEmployee'
import { TerminationSummary } from './TerminationSummary/TerminationSummary'

interface TerminationsDataProps {
  companyId: string
  useMockData?: boolean
}

const MOCK_TERMINATION_PERIODS: UnprocessedTerminationPayPeriod[] = [
  {
    employeeUuid: 'mock-employee-past-123',
    employeeName: 'John Doe (Past Termination - 3 weeks ago)',
    startDate: '2024-12-01',
    endDate: '2024-12-07',
    checkDate: '2024-12-10',
    debitDate: '2024-12-08',
    payScheduleUuid: 'mock-pay-schedule-1',
  },
  {
    employeeUuid: 'mock-employee-past-123',
    employeeName: 'John Doe (Past Termination - 3 weeks ago)',
    startDate: '2024-12-08',
    endDate: '2024-12-14',
    checkDate: '2024-12-17',
    debitDate: '2024-12-15',
    payScheduleUuid: 'mock-pay-schedule-1',
  },
  {
    employeeUuid: 'mock-employee-past-123',
    employeeName: 'John Doe (Past Termination - 3 weeks ago)',
    startDate: '2024-12-15',
    endDate: '2024-12-21',
    checkDate: '2024-12-24',
    debitDate: '2024-12-22',
    payScheduleUuid: 'mock-pay-schedule-1',
  },
  {
    employeeUuid: 'mock-employee-recent-456',
    employeeName: 'Jane Smith (Recent Termination)',
    startDate: '2024-12-22',
    endDate: '2024-12-28',
    checkDate: '2024-12-31',
    debitDate: '2024-12-29',
    payScheduleUuid: 'mock-pay-schedule-2',
  },
]

const MOCK_TERMINATED_EMPLOYEES: ShowEmployees[] = [
  {
    uuid: 'mock-employee-past-123',
    firstName: 'John',
    lastName: 'Doe',
    terminated: true,
    terminations: [
      {
        effectiveDate: '2024-12-01',
        active: true,
        runTerminationPayroll: true,
        cancelable: false,
      },
    ],
  } as ShowEmployees,
  {
    uuid: 'mock-employee-recent-456',
    firstName: 'Jane',
    lastName: 'Smith',
    terminated: true,
    terminations: [
      {
        effectiveDate: '2024-12-22',
        active: true,
        runTerminationPayroll: true,
        cancelable: true,
      },
    ],
  } as ShowEmployees,
]

const MOCK_DISMISSAL_PAYROLLS: Payroll[] = [
  {
    payrollUuid: 'mock-payroll-dismissal-1',
    companyUuid: 'mock-company',
    processed: false,
    offCycle: true,
    offCycleReason: OffCycleReasonType.DismissedEmployee,
    checkDate: '2024-12-10',
    payPeriod: {
      startDate: '2024-12-01',
      endDate: '2024-12-07',
    },
    finalTerminationPayroll: true,
  } as Payroll,
  {
    payrollUuid: 'mock-payroll-dismissal-2',
    companyUuid: 'mock-company',
    processed: false,
    offCycle: true,
    offCycleReason: OffCycleReasonType.DismissedEmployee,
    checkDate: '2024-12-17',
    payPeriod: {
      startDate: '2024-12-08',
      endDate: '2024-12-14',
    },
    finalTerminationPayroll: true,
  } as Payroll,
  {
    payrollUuid: 'mock-payroll-dismissal-3',
    companyUuid: 'mock-company',
    processed: false,
    offCycle: true,
    offCycleReason: OffCycleReasonType.DismissedEmployee,
    checkDate: '2024-12-24',
    payPeriod: {
      startDate: '2024-12-15',
      endDate: '2024-12-21',
    },
    finalTerminationPayroll: true,
  } as Payroll,
  {
    payrollUuid: 'mock-payroll-dismissal-4',
    companyUuid: 'mock-company',
    processed: false,
    offCycle: true,
    offCycleReason: OffCycleReasonType.DismissedEmployee,
    checkDate: '2024-12-31',
    payPeriod: {
      startDate: '2024-12-22',
      endDate: '2024-12-28',
    },
    finalTerminationPayroll: true,
  } as Payroll,
]

type EmployeeInfo = {
  uuid: string
  firstName: string | null | undefined
  lastName: string | null | undefined
  excluded?: boolean
}

const MOCK_EMPLOYEES_BY_PAYROLL: Record<string, EmployeeInfo[]> = {
  'mock-payroll-dismissal-1': [
    { uuid: 'mock-employee-past-123', firstName: 'John', lastName: 'Doe', excluded: false },
  ],
  'mock-payroll-dismissal-2': [
    { uuid: 'mock-employee-past-123', firstName: 'John', lastName: 'Doe', excluded: false },
  ],
  'mock-payroll-dismissal-3': [
    { uuid: 'mock-employee-past-123', firstName: 'John', lastName: 'Doe', excluded: false },
  ],
  'mock-payroll-dismissal-4': [
    { uuid: 'mock-employee-recent-456', firstName: 'Jane', lastName: 'Smith', excluded: false },
  ],
}

const mockDataBannerStyles: React.CSSProperties = {
  backgroundColor: '#fef3c7',
  border: '2px dashed #f59e0b',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const mockBadgeStyles: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  backgroundColor: '#f59e0b',
  color: 'white',
  marginLeft: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

type PayrollCategory = 'Regular' | 'Off-Cycle' | 'Dismissal'

const getPayrollCategory = (payroll: Payroll): PayrollCategory => {
  if (
    payroll.offCycleReason === OffCycleReasonType.DismissedEmployee ||
    payroll.finalTerminationPayroll
  ) {
    return 'Dismissal'
  }
  if (payroll.offCycle) {
    return 'Off-Cycle'
  }
  return 'Regular'
}

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '24px',
  fontSize: '14px',
}

const thStyles: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 8px',
  borderBottom: '2px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontWeight: 600,
}

const tdStyles: React.CSSProperties = {
  padding: '12px 8px',
  borderBottom: '1px solid #e5e7eb',
}

const sectionStyles: React.CSSProperties = {
  marginBottom: '32px',
}

const headingStyles: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#111827',
}

const badgeStyles: Record<PayrollCategory, React.CSSProperties> = {
  Regular: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  'Off-Cycle': {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  Dismissal: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
}

const boolDisplayValue = (value: boolean | null | undefined): string => {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'N/A'
}

const tooltipStyles: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#1f2937',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  whiteSpace: 'normal',
  zIndex: 1000,
  marginBottom: '4px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '250px',
  minWidth: '150px',
}

const modalOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modalContentStyles: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '24px',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
}

const selectStyles: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: 'white',
  cursor: 'pointer',
  marginBottom: '20px',
}

type PayrollEmployeeData = {
  loading: boolean
  loaded: boolean
  employees: EmployeeInfo[]
  error?: string
}

function EmployeeCountCell({
  payroll,
  companyId,
  isMockData,
}: {
  payroll: Payroll
  companyId: string
  isMockData?: boolean
}) {
  const gustoEmbedded = useGustoEmbeddedContext()
  const payrollId = payroll.payrollUuid || payroll.uuid
  const isMockPayroll = payrollId?.startsWith('mock-')

  const mockEmployees = isMockPayroll && payrollId ? MOCK_EMPLOYEES_BY_PAYROLL[payrollId] || [] : []

  const [employeeData, setEmployeeData] = useState<PayrollEmployeeData>(() => {
    if (isMockPayroll) {
      return {
        loading: false,
        loaded: true,
        employees: mockEmployees,
      }
    }
    return {
      loading: false,
      loaded: false,
      employees: [],
    }
  })
  const [showTooltip, setShowTooltip] = useState(false)

  const loadEmployees = async () => {
    if (isMockPayroll || employeeData.loaded || employeeData.loading) return

    setEmployeeData(prev => ({ ...prev, loading: true }))

    if (!payrollId) {
      setEmployeeData({ loading: false, loaded: true, employees: [], error: 'No payroll ID' })
      return
    }

    const result = await payrollsPrepare(gustoEmbedded, { companyId, payrollId })

    if (!result.ok) {
      setEmployeeData({
        loading: false,
        loaded: true,
        employees: [],
        error: 'Failed to load',
      })
      return
    }

    const preparedPayroll = result.value as { payrollPrepared?: PayrollPrepared }
    const employeeCompensations = preparedPayroll.payrollPrepared?.employeeCompensations || []

    const employees: EmployeeInfo[] = employeeCompensations.map(ec => ({
      uuid: ec.employeeUuid || '',
      firstName: ec.firstName,
      lastName: ec.lastName,
      excluded: ec.excluded,
    }))

    setEmployeeData({
      loading: false,
      loaded: true,
      employees,
    })
  }

  const getDisplayText = () => {
    if (employeeData.loading) return 'Loading...'
    if (employeeData.error) return 'Error'
    if (employeeData.loaded) {
      const active = employeeData.employees.filter(e => !e.excluded).length
      const total = employeeData.employees.length
      return active === total ? `${total}` : `${active}/${total}`
    }
    return 'Click to load'
  }

  const renderEmployeeList = () => {
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {employeeData.employees.map((e, idx) => {
          const name = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Unknown'
          return (
            <li key={e.uuid || idx} style={{ padding: '2px 0' }}>
              {e.excluded ? `${name} (excluded)` : name}
            </li>
          )
        })}
      </ul>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void loadEmployees()
    }
  }

  return (
    <td style={tdStyles}>
      <button
        type="button"
        style={{
          position: 'relative',
          display: 'inline-block',
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          cursor: 'pointer',
          color: employeeData.loaded ? '#111827' : '#3b82f6',
          textDecoration: employeeData.loaded ? 'none' : 'underline',
        }}
        onClick={() => {
          void loadEmployees()
        }}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          if (employeeData.loaded) setShowTooltip(true)
        }}
        onMouseLeave={() => {
          setShowTooltip(false)
        }}
      >
        {getDisplayText()}
        {showTooltip && employeeData.loaded && (
          <div style={tooltipStyles}>
            {employeeData.employees.length > 0 ? renderEmployeeList() : 'No employees on payroll'}
          </div>
        )}
      </button>
    </td>
  )
}

function PayrollTable({
  payrolls,
  companyId,
  isMockData,
}: {
  payrolls: Payroll[]
  companyId: string
  isMockData?: boolean
}) {
  if (payrolls.length === 0) {
    return <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No payrolls found.</p>
  }

  return (
    <table style={tableStyles}>
      <thead>
        <tr>
          <th style={thStyles}>Pay Period</th>
          <th style={thStyles}>Check Date</th>
          <th style={thStyles}>Type</th>
          <th style={thStyles}>Employees</th>
          <th style={thStyles}>Off-Cycle</th>
          <th style={thStyles}>Off-Cycle Reason</th>
          <th style={thStyles}>Final Term</th>
          <th style={thStyles}>Status</th>
          <th style={thStyles}>Payroll ID</th>
          {isMockData && <th style={thStyles}>Source</th>}
        </tr>
      </thead>
      <tbody>
        {payrolls.map(payroll => {
          const category = getPayrollCategory(payroll)
          const payPeriodDisplay = payroll.payPeriod
            ? `${payroll.payPeriod.startDate} - ${payroll.payPeriod.endDate}`
            : 'N/A'
          const isMockRow = payroll.payrollUuid?.startsWith('mock-')

          return (
            <tr
              key={payroll.payrollUuid || payroll.uuid}
              style={isMockRow ? { backgroundColor: '#fffbeb' } : undefined}
            >
              <td style={tdStyles}>
                {payPeriodDisplay}
                {isMockRow && <span style={mockBadgeStyles}>Mock</span>}
              </td>
              <td style={tdStyles}>{payroll.checkDate || 'N/A'}</td>
              <td style={tdStyles}>
                <span style={badgeStyles[category]}>{category}</span>
              </td>
              <EmployeeCountCell payroll={payroll} companyId={companyId} isMockData={isMockData} />
              <td style={tdStyles}>{boolDisplayValue(payroll.offCycle)}</td>
              <td style={tdStyles}>{payroll.offCycleReason || '-'}</td>
              <td style={tdStyles}>{boolDisplayValue(payroll.finalTerminationPayroll)}</td>
              <td style={tdStyles}>{payroll.processed ? 'Processed' : 'Unprocessed'}</td>
              <td style={{ ...tdStyles, fontFamily: 'monospace', fontSize: '12px' }}>
                {payroll.payrollUuid || payroll.uuid}
              </td>
              {isMockData && (
                <td style={tdStyles}>
                  <span
                    style={{
                      ...mockBadgeStyles,
                      marginLeft: 0,
                      backgroundColor: isMockRow ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {isMockRow ? 'Mock' : 'Real'}
                  </span>
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TerminationPayPeriodsTable({
  periods,
  isMockData,
}: {
  periods: UnprocessedTerminationPayPeriod[]
  isMockData?: boolean
}) {
  if (periods.length === 0) {
    return (
      <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
        No unprocessed termination pay periods found.
      </p>
    )
  }

  return (
    <table style={tableStyles}>
      <thead>
        <tr>
          <th style={thStyles}>Employee</th>
          <th style={thStyles}>Pay Period</th>
          <th style={thStyles}>Check Date</th>
          <th style={thStyles}>Debit Date</th>
          <th style={thStyles}>Employee ID</th>
          {isMockData && <th style={thStyles}>Source</th>}
        </tr>
      </thead>
      <tbody>
        {periods.map((period, index) => {
          const payPeriodDisplay =
            period.startDate && period.endDate ? `${period.startDate} - ${period.endDate}` : 'N/A'
          const isMockRow = period.employeeUuid?.startsWith('mock-')

          return (
            <tr
              key={`${period.employeeUuid ?? index}-${period.startDate ?? index}`}
              style={isMockRow ? { backgroundColor: '#fffbeb' } : undefined}
            >
              <td style={tdStyles}>
                {period.employeeName || 'Unknown'}
                {isMockRow && <span style={mockBadgeStyles}>Mock</span>}
              </td>
              <td style={tdStyles}>{payPeriodDisplay}</td>
              <td style={tdStyles}>{period.checkDate || 'N/A'}</td>
              <td style={tdStyles}>{period.debitDate || 'N/A'}</td>
              <td style={{ ...tdStyles, fontFamily: 'monospace', fontSize: '12px' }}>
                {period.employeeUuid}
              </td>
              {isMockData && (
                <td style={tdStyles}>
                  <span
                    style={{
                      ...mockBadgeStyles,
                      marginLeft: 0,
                      backgroundColor: isMockRow ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {isMockRow ? 'Mock' : 'Real'}
                  </span>
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TerminatedEmployeesTable({
  employees,
  isMockData,
  onViewSummary,
}: {
  employees: ShowEmployees[]
  isMockData?: boolean
  onViewSummary: (employeeId: string) => void
}) {
  if (employees.length === 0) {
    return <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No terminated employees found.</p>
  }

  return (
    <table style={tableStyles}>
      <thead>
        <tr>
          <th style={thStyles}>Employee</th>
          <th style={thStyles}>Effective Date</th>
          <th style={thStyles}>Active</th>
          <th style={thStyles}>Dismissal Payroll</th>
          <th style={thStyles}>Cancelable</th>
          <th style={thStyles}>Employee ID</th>
          {isMockData && <th style={thStyles}>Source</th>}
          <th style={thStyles}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(employee => {
          const termination = employee.terminations?.[0]
          const employeeName =
            `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown'
          const isMockRow = employee.uuid.startsWith('mock-')

          return (
            <tr key={employee.uuid} style={isMockRow ? { backgroundColor: '#fffbeb' } : undefined}>
              <td style={tdStyles}>
                {employeeName}
                {isMockRow && <span style={mockBadgeStyles}>Mock</span>}
              </td>
              <td style={tdStyles}>{termination?.effectiveDate || 'N/A'}</td>
              <td style={tdStyles}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: termination?.active ? '#fee2e2' : '#d1fae5',
                    color: termination?.active ? '#991b1b' : '#065f46',
                  }}
                >
                  {termination?.active ? 'Terminated' : 'Scheduled'}
                </span>
              </td>
              <td style={tdStyles}>{boolDisplayValue(termination?.runTerminationPayroll)}</td>
              <td style={tdStyles}>{boolDisplayValue(termination?.cancelable)}</td>
              <td style={{ ...tdStyles, fontFamily: 'monospace', fontSize: '12px' }}>
                {employee.uuid}
              </td>
              {isMockData && (
                <td style={tdStyles}>
                  <span
                    style={{
                      ...mockBadgeStyles,
                      marginLeft: 0,
                      backgroundColor: isMockRow ? '#f59e0b' : '#10b981',
                    }}
                  >
                    {isMockRow ? 'Mock' : 'Real'}
                  </span>
                </td>
              )}
              <td style={tdStyles}>
                <button
                  type="button"
                  onClick={() => {
                    onViewSummary(employee.uuid)
                  }}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  View summary
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

interface TerminationModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  activeEmployees: ShowEmployees[]
  onTerminationComplete: () => void
}

function TerminationModal({
  isOpen,
  onClose,
  companyId,
  activeEmployees,
  onTerminationComplete,
}: TerminationModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')

  if (!isOpen) return null

  const handleClose = () => {
    onClose()
    setSelectedEmployeeId('')
  }

  const handleTerminationEvent = (event: string) => {
    if (event === 'employee/termination/done' || event === 'cancel') {
      onTerminationComplete()
      handleClose()
    }
  }

  return (
    <div role="presentation" style={modalOverlayStyles}>
      <button
        type="button"
        aria-label="Close modal"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'default',
          zIndex: 1,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ ...modalContentStyles, position: 'relative', zIndex: 2 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Terminate Employee</h2>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="employee-select"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}
          >
            Select Employee
          </label>
          <select
            id="employee-select"
            value={selectedEmployeeId}
            onChange={e => {
              setSelectedEmployeeId(e.target.value)
            }}
            style={selectStyles}
          >
            <option value="">-- Select an employee --</option>
            {activeEmployees.map(employee => {
              const name =
                `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown'
              return (
                <option key={employee.uuid} value={employee.uuid}>
                  {name}
                </option>
              )
            })}
          </select>
        </div>

        {selectedEmployeeId ? (
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px',
            }}
          >
            <Suspense
              fallback={
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  Loading employee data...
                </div>
              }
            >
              <TerminateEmployee
                employeeId={selectedEmployeeId}
                companyId={companyId}
                onEvent={handleTerminationEvent}
              />
            </Suspense>
          </div>
        ) : (
          <p
            style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}
          >
            Select an employee to begin the termination process.
          </p>
        )}
      </div>
    </div>
  )
}

interface TerminationSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  employeeId: string | null
}

function TerminationSummaryModal({
  isOpen,
  onClose,
  companyId,
  employeeId,
}: TerminationSummaryModalProps) {
  if (!isOpen || !employeeId) return null

  const handleEvent = (event: string) => {
    if (
      event === 'employee/termination/cancelled' ||
      event === 'employee/termination/edit' ||
      event === 'employee/termination/runPayroll' ||
      event === 'employee/termination/runOffCyclePayroll'
    ) {
      onClose()
    }
  }

  return (
    <div role="presentation" style={modalOverlayStyles}>
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'default',
          zIndex: 1,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ ...modalContentStyles, position: 'relative', zIndex: 2 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Termination Summary</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <Suspense
          fallback={
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              Loading termination summary...
            </div>
          }
        >
          <TerminationSummary employeeId={employeeId} companyId={companyId} onEvent={handleEvent} />
        </Suspense>
      </div>
    </div>
  )
}

function TerminationsDataContent({ companyId, useMockData }: TerminationsDataProps) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showMockData, setShowMockData] = useState(useMockData ?? false)
  const [summaryEmployeeId, setSummaryEmployeeId] = useState<string | null>(null)

  const today = new Date()
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
  const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const { data: payrollsData, refetch: refetchPayrolls } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    payrollTypes: [PayrollTypes.Regular, PayrollTypes.OffCycle],
    includeOffCycle: true,
    startDate: formatDate(threeMonthsAgo),
    endDate: formatDate(threeMonthsFromNow),
  })

  const { data: terminationPeriodsData } = usePaySchedulesGetUnprocessedTerminationPeriodsSuspense({
    companyId,
  })

  const { data: terminatedEmployeesData } = useEmployeesListSuspense({
    companyId,
    terminated: true,
  })

  const { data: activeEmployeesData } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    onboarded: true,
  })

  const handleRefresh = () => {
    void refetchPayrolls()
  }

  const handleTerminationComplete = () => {
    void invalidateAllEmployeesList(queryClient)
    void refetchPayrolls()
  }

  const realPayrollList = payrollsData.payrollList || []
  const realTerminationPeriods = terminationPeriodsData.unprocessedTerminationPayPeriodList || []
  const realTerminatedEmployees = terminatedEmployeesData.showEmployees || []
  const activeEmployees = activeEmployeesData.showEmployees || []

  const payrollList = showMockData
    ? [...MOCK_DISMISSAL_PAYROLLS, ...realPayrollList]
    : realPayrollList

  const terminationPeriods = showMockData
    ? [...MOCK_TERMINATION_PERIODS, ...realTerminationPeriods]
    : realTerminationPeriods

  const terminatedEmployees = showMockData
    ? [...MOCK_TERMINATED_EMPLOYEES, ...realTerminatedEmployees]
    : realTerminatedEmployees

  const regularPayrolls = payrollList.filter(p => getPayrollCategory(p) === 'Regular')
  const offCyclePayrolls = payrollList.filter(p => getPayrollCategory(p) === 'Off-Cycle')
  const dismissalPayrolls = payrollList.filter(p => getPayrollCategory(p) === 'Dismissal')

  const mockPeriodCount = showMockData ? MOCK_TERMINATION_PERIODS.length : 0
  const mockEmployeeCount = showMockData ? MOCK_TERMINATED_EMPLOYEES.length : 0
  const mockPayrollCount = showMockData ? MOCK_DISMISSAL_PAYROLLS.length : 0

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Terminations Data - Payroll Overview
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setShowMockData(!showMockData)
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: showMockData ? '#f59e0b' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {showMockData ? '🧪 Mock Data ON' : '🧪 Mock Data OFF'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true)
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Terminate Employee
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Refresh Payrolls
          </button>
        </div>
      </div>

      {showMockData && (
        <div style={mockDataBannerStyles}>
          <span style={{ fontSize: '24px' }}>🧪</span>
          <div>
            <strong style={{ color: '#92400e' }}>Mock Data Mode Enabled</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#78350f' }}>
              Simulating a past-dated termination scenario: John Doe was terminated 3 weeks ago with{' '}
              <strong>{mockPeriodCount} unprocessed pay periods</strong> and{' '}
              <strong>{mockPayrollCount} corresponding dismissal payrolls</strong> (one for each
              period). This demonstrates how our EmployeeTerminations component creates separate
              payrolls for each unprocessed period. Mock rows are highlighted in yellow with a
              &quot;MOCK&quot; badge.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{payrollList.length}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Unprocessed</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{regularPayrolls.length}</div>
          <div style={{ fontSize: '14px', color: '#1e40af' }}>Regular</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{offCyclePayrolls.length}</div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>Off-Cycle</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{dismissalPayrolls.length}</div>
          <div style={{ fontSize: '14px', color: '#991b1b' }}>Dismissal</div>
        </div>
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>
          All Unprocessed Payrolls
          {showMockData && (
            <span style={{ ...mockBadgeStyles, fontSize: '10px' }}>
              +{mockPayrollCount} Mock Dismissal
            </span>
          )}
        </h2>
        <PayrollTable payrolls={payrollList} companyId={companyId} isMockData={showMockData} />
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>Regular Payrolls</h2>
        <PayrollTable payrolls={regularPayrolls} companyId={companyId} isMockData={showMockData} />
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>Off-Cycle Payrolls</h2>
        <PayrollTable payrolls={offCyclePayrolls} companyId={companyId} isMockData={showMockData} />
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>
          Dismissal Payrolls
          {showMockData && (
            <span style={{ ...mockBadgeStyles, fontSize: '10px' }}>+{mockPayrollCount} Mock</span>
          )}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
          Off-cycle payrolls created for dismissed employees.
          {showMockData && (
            <strong style={{ color: '#92400e' }}>
              {' '}
              These 3 mock payrolls correspond to John Doe&apos;s 3 unprocessed pay periods - each
              created by our EmployeeTerminations component.
            </strong>
          )}
        </p>
        <PayrollTable
          payrolls={dismissalPayrolls}
          companyId={companyId}
          isMockData={showMockData}
        />
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>
          Unprocessed Termination Pay Periods
          {showMockData && (
            <span style={{ ...mockBadgeStyles, fontSize: '10px' }}>+{mockPeriodCount} Mock</span>
          )}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
          These are pay periods for employees who selected &quot;Dismissal Payroll&quot; as their
          final payroll option. Match the pay period dates with the payrolls above to identify which
          payroll corresponds to each terminated employee.
          {showMockData && (
            <strong style={{ color: '#92400e' }}>
              {' '}
              Note: John Doe has 3 unprocessed pay periods (simulating a past-dated termination).
            </strong>
          )}
        </p>
        <TerminationPayPeriodsTable periods={terminationPeriods} isMockData={showMockData} />
      </div>

      <div style={sectionStyles}>
        <h2 style={headingStyles}>
          All Terminated Employees ({terminatedEmployees.length})
          {showMockData && (
            <span style={{ ...mockBadgeStyles, fontSize: '10px' }}>+{mockEmployeeCount} Mock</span>
          )}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
          All employees who have been terminated or are scheduled to be terminated.
        </p>
        <TerminatedEmployeesTable
          employees={terminatedEmployees}
          isMockData={showMockData}
          onViewSummary={setSummaryEmployeeId}
        />
      </div>

      <TerminationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        companyId={companyId}
        activeEmployees={activeEmployees}
        onTerminationComplete={handleTerminationComplete}
      />

      <TerminationSummaryModal
        isOpen={summaryEmployeeId !== null}
        onClose={() => {
          setSummaryEmployeeId(null)
        }}
        companyId={companyId}
        employeeId={summaryEmployeeId}
      />
    </div>
  )
}

export function TerminationsData({ companyId, useMockData }: TerminationsDataProps) {
  return (
    <Suspense
      fallback={<div style={{ padding: '24px', color: '#6b7280' }}>Loading payroll data...</div>}
    >
      <TerminationsDataContent companyId={companyId} useMockData={useMockData} />
    </Suspense>
  )
}
