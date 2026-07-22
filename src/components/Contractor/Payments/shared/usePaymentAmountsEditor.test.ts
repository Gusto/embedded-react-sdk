import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { usePaymentAmountsEditor } from './usePaymentAmountsEditor'
import type { EditContractorPaymentFormValues } from '../CreatePayment/EditContractorPaymentFormSchema'

const contractor: Contractor = {
  uuid: 'contractor-1',
  isActive: true,
  type: 'Individual',
  firstName: 'Ada',
  lastName: 'Lovelace',
  wageType: 'Fixed',
  paymentMethod: 'Direct Deposit',
}

describe('usePaymentAmountsEditor', () => {
  it('rejects a submitted payment method outside allowedPaymentMethods', () => {
    const onEditSave = vi.fn()
    const { result } = renderHook(() =>
      usePaymentAmountsEditor({
        contractors: [contractor],
        allowedPaymentMethods: ['Check', 'Direct Deposit'],
        onEditSave,
      }),
    )

    act(() => {
      result.current.editModal.submit({
        wageType: 'Fixed',
        wage: 100,
        paymentMethod: 'Historical Payment',
        contractorUuid: 'contractor-1',
      } as EditContractorPaymentFormValues)
    })

    expect(result.current.editModal.formMethods.getFieldState('paymentMethod').error?.message).toBe(
      'unsupportedPaymentMethod',
    )
    expect(onEditSave).not.toHaveBeenCalled()
    expect(
      result.current.virtualContractorPayments.find(p => p.contractorUuid === 'contractor-1'),
    ).toMatchObject({ wage: '0', isTouched: false })
  })

  it('accepts a submitted payment method within allowedPaymentMethods', () => {
    const onEditSave = vi.fn()
    const { result } = renderHook(() =>
      usePaymentAmountsEditor({
        contractors: [contractor],
        allowedPaymentMethods: ['Check', 'Direct Deposit'],
        onEditSave,
      }),
    )

    act(() => {
      result.current.editModal.submit({
        wageType: 'Fixed',
        wage: 100,
        paymentMethod: 'Direct Deposit',
        contractorUuid: 'contractor-1',
      } as EditContractorPaymentFormValues)
    })

    expect(
      result.current.editModal.formMethods.getFieldState('paymentMethod').error,
    ).toBeUndefined()
    expect(onEditSave).toHaveBeenCalledTimes(1)
    expect(
      result.current.virtualContractorPayments.find(p => p.contractorUuid === 'contractor-1'),
    ).toMatchObject({ wage: '100', isTouched: true })
  })
})
