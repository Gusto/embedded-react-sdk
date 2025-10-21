import { useTranslation } from 'react-i18next'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { PayrollBlockerList, type PayrollBlocker } from './components/PayrollBlockerList'
import { getBlockerTranslationKeys } from './payrollHelpers'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

interface PayrollBlockerProps extends BaseComponentInterface<'Payroll.PayrollBlocker'> {
  companyId: string
}

export function PayrollBlocker(props: PayrollBlockerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, dictionary, companyId }: PayrollBlockerProps) {
  useComponentDictionary('Payroll.PayrollBlocker', dictionary)
  useI18n('Payroll.PayrollBlocker')
  const { t } = useTranslation('Payroll.PayrollBlocker')

  const { data } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = data.payrollBlockerList ?? []

  const blockers: PayrollBlocker[] = payrollBlockerList.map(blocker => {
    const blockerKey = blocker.key ?? 'unknown'
    const translationKeys = getBlockerTranslationKeys(blockerKey)

    const title = t(translationKeys.titleKey, {
      defaultValue: blockerKey.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
    })

    const description = t(translationKeys.descriptionKey, {
      defaultValue: blocker.message || t('defaultBlockerDescription'),
    })

    return {
      id: blockerKey,
      title,
      description,
    }
  })

  if (blockers.length === 0) {
    return null
  }

  return <PayrollBlockerList className={className} blockers={blockers} />
}
