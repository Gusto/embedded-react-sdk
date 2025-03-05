import { assert, beforeEach, describe, it } from 'vitest'
import { EmployeeSelfOnboardingFlow } from './EmployeeSelfOnboardingFlow'
import { render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { GustoApiProvider } from '@/contexts'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/api/constants'

type FillDateArgs = {
  date: {
    month: number
    day: number
    year: number
  }
  name: string
  user: UserEvent
}
const fillDate = async ({ date: { month, day, year }, name, user }: FillDateArgs) => {
  const dateOfBirthInput = await screen.findByRole('group', { name })
  await user.type(
    within(dateOfBirthInput).getByRole('spinbutton', { name: /month/i }),
    String(month),
  )
  await user.type(within(dateOfBirthInput).getByRole('spinbutton', { name: /day/i }), String(day))
  await user.type(within(dateOfBirthInput).getByRole('spinbutton', { name: /year/i }), String(year))
}

describe('EmployeeSelfOnboardingFlow', () => {
  describe('simplest happy path case', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE_URL}/v1/employees/:employee_id`, ({ params }) =>
          HttpResponse.json({
            uuid: params.employee_id,
            first_name: 'Lucy',
            last_name: 'MacLean',
            payment_method: 'Direct Deposit',
          }),
        ),
        http.get(`${API_BASE_URL}/v1/companies/:company_id`, () => HttpResponse.json({})),
        http.get(`${API_BASE_URL}/v1/companies/:company_id/locations`, ({ params }) =>
          HttpResponse.json([]),
        ),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, ({ params }) =>
          HttpResponse.json([]),
        ),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, ({ params }) =>
          HttpResponse.json([]),
        ),
        http.put(`${API_BASE_URL}/v1/employees/:employee_id`, ({ params }) =>
          HttpResponse.json({
            uuid: params.employee_id,
          }),
        ),
        http.post(`${API_BASE_URL}/v1/employees/:employee_id/home_addresses`, () =>
          HttpResponse.json(),
        ),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/federal_taxes`, () =>
          HttpResponse.json(),
        ),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/state_taxes`, () =>
          HttpResponse.json([]),
        ),
      )
    })

    it('succeeds', async () => {
      const user = userEvent.setup()
      render(
        <GustoApiProvider>
          <EmployeeSelfOnboardingFlow companyId="123" employeeId="456" onEvent={() => {}} />
        </GustoApiProvider>,
      )

      // Page 1 - Get Started
      await user.click(await screen.findByRole('button', { name: /started/i }))

      // Page 2 - Personal Details
      await user.type(await screen.findByLabelText(/social/i), '456789012')

      await fillDate({ date: { month: 1, day: 1, year: 2000 }, name: 'Date of birth', user })
      await user.type(await screen.findByLabelText('Street 1'), '123 Any St')
      await user.type(await screen.findByLabelText(/city/i), 'Redmond')
      await user.click(await screen.findByLabelText('State'))
      await user.click(await screen.findByRole('option', { name: 'Washington' }))
      await user.type(await screen.findByLabelText(/zip/i), '98074')
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 3 - Federal / State Taxes
      // TODO: Cannot select federal filing status for some reason....
      await user.click(await screen.findByRole('option', { name: /single/i, hidden: true }))
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 4 - Payment method
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 5 - Sign documents
      await user.click(await screen.findByRole('button', { name: 'Continue' }))

      // Page 6 - Completed
      await screen.findByText('completed setup')
    })
  })
})
