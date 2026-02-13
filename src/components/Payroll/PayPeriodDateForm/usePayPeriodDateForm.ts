import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { PayPeriodDateFormData } from './PayPeriodDateFormTypes'
import type { OnEventType } from '@/components/Base/useBase'
import { useBase } from '@/components/Base'
import { componentEvents, type EventType } from '@/shared/constants'
import { useI18n } from '@/i18n'

export interface UsePayPeriodDateFormParams {
  onEvent: OnEventType<EventType, unknown>
  initialValues?: Partial<PayPeriodDateFormData>
}

export interface UsePayPeriodDateFormReturn {
  data: {
    isCheckOnly: boolean
  }
  actions: {
    onCheckOnlyChange: (checked: boolean) => void
    onSubmit: (data: PayPeriodDateFormData) => Promise<void>
  }
  meta: {
    isPending: false
  }
  form: {
    handleSubmit: ReturnType<typeof useFormContext<PayPeriodDateFormData>>['handleSubmit']
  }
}

export function usePayPeriodDateForm({
  onEvent,
  initialValues,
}: UsePayPeriodDateFormParams): UsePayPeriodDateFormReturn {
  useI18n('Payroll.PayPeriodDateForm')
  const { baseSubmitHandler } = useBase()
  const { handleSubmit } = useFormContext<PayPeriodDateFormData>()

  const [isCheckOnly, setIsCheckOnly] = useState(initialValues?.isCheckOnly ?? false)

  const onSubmit = async (data: PayPeriodDateFormData) => {
    await baseSubmitHandler(data, () => {
      onEvent(componentEvents.RUN_PAYROLL_DATES_CONFIGURED, {
        isCheckOnly: data.isCheckOnly,
        startDate: data.startDate?.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0],
        checkDate: data.checkDate?.toISOString().split('T')[0],
      })
      return Promise.resolve()
    })
  }

  const onCheckOnlyChange = (checked: boolean) => {
    setIsCheckOnly(checked)
  }

  return {
    data: {
      isCheckOnly,
    },
    actions: {
      onCheckOnlyChange,
      onSubmit,
    },
    meta: {
      isPending: false,
    },
    form: {
      handleSubmit,
    },
  }
}
