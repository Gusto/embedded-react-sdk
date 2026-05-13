import { useEffect } from 'react'
import type { CSSProperties, PropsWithChildren } from 'react'
import { GustoProvider, useEmployeeList } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { Button, Loading, interfaceLibComponents } from '../InterfaceLib'
import { BASE_URL, COMPANY_ID } from './config'

const { Table } = interfaceLibComponents

const pageStyle: CSSProperties = {
  maxWidth: '880px',
  margin: '0 auto',
  padding: '32px 16px',
  fontFamily: "'InterfaceLib Sans', system-ui, sans-serif",
}

const cardStyle: CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
  border: '1px solid #e4e7ec',
}

const cardTitleStyle: CSSProperties = {
  margin: '0 0 4px 0',
  fontSize: '20px',
  fontWeight: 600,
  color: '#101828',
}

const cardDescriptionStyle: CSSProperties = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#475467',
}

const errorBannerStyle: CSSProperties = {
  background: '#fef3f2',
  border: '1px solid #fda29b',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#b42318',
  marginBottom: '16px',
}

const paginationRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '16px',
  fontSize: '14px',
  color: '#475467',
}

const paginationButtonsStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
}

function Card({ children }: PropsWithChildren) {
  return <section style={cardStyle}>{children}</section>
}

function formatName(firstName: string | null | undefined, lastName: string | null | undefined) {
  return [firstName, lastName].filter(Boolean).join(' ') || '—'
}

function formatStatus(status: string | null | undefined) {
  if (!status) return '—'
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(?:^|\s)\S/g, char => char.toUpperCase())
}

function EmployeeListView() {
  const employeeList = useEmployeeList({ companyId: COMPANY_ID })

  const fetchedEmployees = employeeList.isLoading ? undefined : employeeList.data.employees

  useEffect(() => {
    if (fetchedEmployees) {
      console.log('[HooksEmployeeListDemo] employee list fetch complete:', fetchedEmployees)
    }
  }, [fetchedEmployees])

  if (employeeList.isLoading) {
    return <Loading />
  }

  const { data, pagination, errorHandling } = employeeList
  const { employees } = data

  const headers = [
    { key: 'name', content: 'Name' },
    { key: 'status', content: 'Onboarding status' },
    { key: 'title', content: 'Primary job' },
  ]

  const rows = employees.map(employee => ({
    key: employee.uuid,
    data: [
      { key: 'name', content: formatName(employee.firstName, employee.lastName) },
      { key: 'status', content: formatStatus(employee.onboardingStatus) },
      { key: 'title', content: employee.primaryJob?.title ?? '—' },
    ],
  }))

  return (
    <Card>
      <h2 style={cardTitleStyle}>Your team</h2>
      <p style={cardDescriptionStyle}>
        A non-form hook. Same loading / error contract, but the data feeds a table you render
        yourself.
      </p>

      {errorHandling.errors.length > 0 && (
        <div role="alert" style={errorBannerStyle}>
          {errorHandling.errors.map((error, i) => (
            <p key={i} style={{ margin: 0 }}>
              {error.message}
            </p>
          ))}
        </div>
      )}

      <Table headers={headers} rows={rows} emptyState="No employees yet." />

      <div style={paginationRowStyle}>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
          {typeof pagination.totalCount === 'number' ? ` · ${pagination.totalCount} total` : null}
        </span>
        <div style={paginationButtonsStyle}>
          <Button
            variant="secondary"
            onClick={pagination.handlePreviousPage}
            isDisabled={pagination.currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={pagination.handleNextPage}
            isDisabled={pagination.currentPage >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function HooksEmployeeListDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <div style={pageStyle}>
        <EmployeeListView />
      </div>
    </GustoProvider>
  )
}
