import { HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { DocumentList } from './DocumentList'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { handleGetEmployeeForms } from '@/test/mocks/apis/employee_forms'
import { server } from '@/test/mocks/server'

describe('DocumentList', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      handleGetEmployeeForms(() =>
        HttpResponse.json([
          {
            uuid: 'form-dda',
            title: 'Employee Direct Deposit Authorization',
            name: 'employee_direct_deposit',
            description:
              'This document authorizes Gusto to transfer money to and from your bank account.',
            requires_signing: true,
          },
          {
            uuid: 'form-unknown',
            title: 'Some Unrecognized Form',
            name: 'some_unrecognized_form',
            description: 'This description comes straight from the API.',
            requires_signing: false,
          },
        ]),
      ),
    )
  })

  describe('form description overrides', () => {
    it('renders the API-provided description for a known form name with no override', async () => {
      renderWithProviders(<DocumentList employeeId="employee-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'This document authorizes Gusto to transfer money to and from your bank account.',
          ),
        ).toBeInTheDocument()
      })
    })

    it('renders the API-provided description for a form name outside the known catalog', async () => {
      renderWithProviders(<DocumentList employeeId="employee-123" onEvent={() => {}} />)

      await waitFor(() => {
        expect(
          screen.getByText('This description comes straight from the API.'),
        ).toBeInTheDocument()
      })
    })

    // Registers a partner dictionary override on the shared i18next instance, which persists
    // for the rest of this file's test run — keep this the last test in the describe block so
    // it doesn't bleed into the "no override" assertions above.
    it('renders the dictionary override when one is provided for a known form name', async () => {
      renderWithProviders(
        <DocumentList
          employeeId="employee-123"
          onEvent={() => {}}
          dictionary={{
            en: {
              forms: {
                employee_direct_deposit: {
                  description:
                    'This document authorizes [Partner] to transfer money to and from your bank account.',
                },
              },
            },
          }}
        />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'This document authorizes [Partner] to transfer money to and from your bank account.',
          ),
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByText(
          'This document authorizes Gusto to transfer money to and from your bank account.',
        ),
      ).not.toBeInTheDocument()
    })
  })
})
