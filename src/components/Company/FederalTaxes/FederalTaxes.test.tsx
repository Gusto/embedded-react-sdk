import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxes } from './FederalTaxes'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyFederalTaxes,
  handleUpdateCompanyFederalTaxes,
} from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
describe('FederalTaxes', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('when API has minimal tax details', () => {
    beforeEach(() => {
      server.use(
        handleGetCompanyFederalTaxes(() =>
          HttpResponse.json({
            version: 'federal-tax-details-version',
            has_ein: true,
          }),
        ),
        handleUpdateCompanyFederalTaxes(() =>
          HttpResponse.json({
            has_ein: true,
            filing_form: '941',
            legal_name: 'Test Company',
            tax_payer_type: 'LLC',
            version: 'federal-tax-details-version',
          }),
        ),
      )
    })

    it('should allow submitting the form', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      render(
        <GustoTestApiProvider>
          <FederalTaxes companyId="company_id" onEvent={mockOnEvent} />
        </GustoTestApiProvider>,
      )

      await screen.findByText('Federal Tax Information')

      const einInput = screen.getByLabelText('Federal EIN')
      await user.type(einInput, '123456789')

      const taxPayerTypeSelect = screen.getByLabelText('Taxpayer type')
      await user.click(taxPayerTypeSelect)

      const corporationOption = screen.getByRole('option', {
        name: /LLC/i,
      })
      await user.click(corporationOption)

      const filingFormSelect = screen.getByLabelText('Federal filing form')
      await user.click(filingFormSelect)

      const ninetyFourOneOption = screen.getByRole('option', {
        name: /941/i,
      })
      await user.click(ninetyFourOneOption)

      const legalNameInput = screen.getByLabelText('Legal entity name')
      await user.type(legalNameInput, 'Test Company')

      const continueButton = screen.getByRole('button', {
        name: /Continue/i,
      })
      await user.click(continueButton)

      expect(mockOnEvent).toHaveBeenNthCalledWith(1, companyEvents.COMPANY_FEDERAL_TAXES_UPDATED, {
        filingForm: '941',
        hasEin: true,
        legalName: 'Test Company',
        taxPayerType: 'LLC',
        version: 'federal-tax-details-version',
      })
      expect(mockOnEvent).toHaveBeenNthCalledWith(2, companyEvents.COMPANY_FEDERAL_TAXES_DONE)
    })

    it('should allow setting default values', async () => {
      render(
        <GustoTestApiProvider>
          <FederalTaxes
            companyId="company_id"
            onEvent={() => {}}
            defaultValues={{
              taxPayerType: 'LLC',
              filingForm: '941',
              legalName: 'Default Company',
            }}
          />
        </GustoTestApiProvider>,
      )

      await screen.findByText('Federal Tax Information')

      const einInput = screen.getByLabelText('Federal EIN')
      expect(einInput).toHaveValue('')

      expect(
        screen.getByRole('button', {
          name: /LLC/i,
          expanded: false,
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: /941 - Employer's Quarterly Federal Tax Return/i,
          expanded: false,
        }),
      ).toBeInTheDocument()

      const legalNameInput = screen.getByLabelText('Legal entity name')
      expect(legalNameInput).toHaveValue('Default Company')
    })

    it('should show an error when legal name is not provided', async () => {
      const user = userEvent.setup()
      const mockOnEvent = vi.fn()

      render(
        <GustoTestApiProvider>
          <FederalTaxes companyId="company_id" onEvent={mockOnEvent} />
        </GustoTestApiProvider>,
      )

      await screen.findByText('Federal Tax Information')

      const continueButton = screen.getByRole('button', {
        name: /Continue/i,
      })
      await user.click(continueButton)

      expect(screen.getByText('Legal entity name is required')).toBeInTheDocument()
      expect(mockOnEvent).not.toHaveBeenCalled()
    })
  })

  describe('when API has full tax details', () => {
    beforeEach(() => {
      server.use(
        handleGetCompanyFederalTaxes(() =>
          HttpResponse.json({
            version: 'federal-tax-details-version',
            has_ein: true,
            tax_payer_type: 'S-Corporation',
            filing_form: '944',
            legal_name: 'Test Company',
          }),
        ),
      )
    })

    it('should defer to values from API over default values', async () => {
      render(
        <GustoTestApiProvider>
          <FederalTaxes
            companyId="company_id"
            onEvent={() => {}}
            defaultValues={{
              taxPayerType: 'C-Corporation',
              filingForm: '941',
              legalName: 'Default Company',
            }}
          />
        </GustoTestApiProvider>,
      )

      await screen.findByText('Federal Tax Information')

      const einInput = screen.getByLabelText('Federal EIN')
      expect(einInput).toHaveValue('')

      expect(
        screen.getByRole('button', {
          name: /S-Corporation/i,
          expanded: false,
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: /944 - Employer's Annual Federal Tax Return/i,
          expanded: false,
        }),
      ).toBeInTheDocument()

      const legalNameInput = screen.getByLabelText('Legal entity name')
      expect(legalNameInput).toHaveValue('Test Company')
    })
  })
})
