import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { QuestionInput } from './TaxInputs'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

function TestForm({ requirement }: { requirement: TaxRequirement }) {
  const methods = useForm({ defaultValues: { [requirement.key as string]: requirement.value } })
  return (
    <GustoTestProvider>
      <FormProvider {...methods}>
        <QuestionInput
          requirement={requirement}
          questionType={requirement.metadata?.type ?? 'text'}
        />
      </FormProvider>
    </GustoTestProvider>
  )
}

describe('TaxInputs', () => {
  describe('account_number question type', () => {
    it('renders metadata.prefix as a start adornment ahead of the masked value', () => {
      render(
        <TestForm
          requirement={{
            key: 'ein',
            label: 'EIN suffix',
            value: null,
            metadata: { type: 'account_number', mask: '##', prefix: 'XXXXX1234' },
          }}
        />,
      )

      expect(screen.getByText('XXXXX1234')).toBeInTheDocument()
      expect(screen.getByLabelText('EIN suffix')).toHaveAttribute('placeholder', '##')
    })

    it('renders normally, without a start adornment, when metadata.prefix is null', () => {
      render(
        <TestForm
          requirement={{
            key: 'ubi',
            label: 'UBI number',
            value: null,
            metadata: { type: 'account_number', mask: '### ### ###', prefix: null },
          }}
        />,
      )

      expect(screen.getByLabelText('UBI number')).toHaveAttribute('placeholder', '### ### ###')
    })
  })
})
