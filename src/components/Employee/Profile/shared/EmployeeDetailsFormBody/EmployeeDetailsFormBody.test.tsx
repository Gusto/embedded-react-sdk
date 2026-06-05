import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { useEmployeeDetailsForm } from '../useEmployeeDetailsForm'
import { EmployeeDetailsFormBody } from './EmployeeDetailsFormBody'
import type { EmployeeDetailsFormBodyDictionary } from './EmployeeDetailsFormBody'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetEmployee } from '@/test/mocks/apis/employees'

const employee = {
  uuid: 'employee-123',
  first_name: 'Isom',
  middle_initial: 'J',
  last_name: 'Jaskolski',
  email: 'isom@example.com',
  version: '1',
  date_of_birth: '1986-06-25',
  has_ssn: true,
  ssn: '',
  onboarding_status: 'admin_onboarding_incomplete',
  jobs: [],
}

function Harness({
  withEmail,
  dictionary,
}: {
  withEmail?: boolean
  dictionary?: EmployeeDetailsFormBodyDictionary
}) {
  const employeeDetails = useEmployeeDetailsForm({
    employeeId: 'employee-123',
    withSelfOnboardingField: false,
  })

  if (employeeDetails.isLoading) return null

  return (
    <EmployeeDetailsFormBody
      formHookResult={employeeDetails}
      withEmail={withEmail}
      dictionary={dictionary}
    />
  )
}

describe('EmployeeDetailsFormBody', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(handleGetEmployee(() => HttpResponse.json(employee)))
  })

  it('renders the personal-details fields with default copy', async () => {
    renderWithProviders(<Harness />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/Legal first name/)).toHaveValue('Isom')
    expect(screen.getByLabelText(/Middle initial/)).toHaveValue('J')
    expect(screen.getByLabelText(/Legal last name/)).toHaveValue('Jaskolski')
    expect(screen.getByLabelText(/Social Security Number/)).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Date of birth/ })).toBeInTheDocument()
  })

  it('omits the email field by default and renders it when withEmail is set', async () => {
    const { rerender } = renderWithProviders(<Harness />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Legal first name/)).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/Personal email/)).toBeNull()

    rerender(<Harness withEmail />)

    await waitFor(() => {
      expect(screen.getByLabelText(/Personal email/)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/Personal email/)).toHaveValue('isom@example.com')
  })

  it('applies an injected dictionary to the field copy', async () => {
    renderWithProviders(
      <Harness
        dictionary={{
          en: {
            firstName: 'Custom first name',
            lastName: 'Custom last name',
          },
        }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Custom first name/)).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/Custom last name/)).toBeInTheDocument()
  })
})
