import { Trans, useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import {
  useSplitPaymentsForm,
  type SplitByValue,
  type SplitFieldEntry,
  type UseSplitPaymentsFormProps,
  type UseSplitPaymentsFormReady,
} from '../shared/useSplitPaymentsForm'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, SPLIT_BY, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface PaymentMethodSplitFormProps extends Omit<UseSplitPaymentsFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone split-paycheck form for the management flow. Owns its own data via
 * {@link useSplitPaymentsForm} and emits the per-component scoped events
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED` and
 * `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED`. Reads its copy from
 * the dedicated `Employee.Management.PaymentMethodSplitForm` namespace so partner
 * overrides on the management split form don't leak into the onboarding form.
 */
export function PaymentMethodSplitForm({
  employeeId,
  onEvent,
  ...hookProps
}: PaymentMethodSplitFormProps) {
  useI18n('Employee.Management.PaymentMethodSplitForm')
  const splitForm = useSplitPaymentsForm({ employeeId, ...hookProps })

  if (splitForm.isLoading) {
    return <BaseLayout isLoading error={splitForm.errorHandling.errors} />
  }

  return <PaymentMethodSplitFormReady onEvent={onEvent} splitForm={splitForm} />
}

interface PaymentMethodSplitFormReadyProps {
  onEvent: OnEventType<EventType, unknown>
  splitForm: UseSplitPaymentsFormReady
}

function PaymentMethodSplitFormReady({ onEvent, splitForm }: PaymentMethodSplitFormReadyProps) {
  const { t } = useTranslation('Employee.Management.PaymentMethodSplitForm')
  const Components = useComponentContext()
  const { Fields } = splitForm.form
  const { remainderId, bankAccounts } = splitForm.data
  const { splitBy, percentageTotal, hasPercentageImbalance } = splitForm.status

  const handleSubmit = async () => {
    const result = await splitForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED, result.data)
    }
  }

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED)
  }

  if (bankAccounts.length < 2) return null

  const labelForSplit = (split: SplitFieldEntry) =>
    t('splitAmountLabel', {
      name: DOMPurify.sanitize(split.name ?? ''),
      account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
      interpolation: { escapeValue: false },
    })

  const handleReorder = (indices: number[]) => {
    const orderedUuids = indices
      .map(index => Fields.splits[index]?.uuid)
      .filter((uuid): uuid is string => Boolean(uuid))
    splitForm.actions.reorderSplits(orderedUuids)
  }

  return (
    <BaseLayout error={splitForm.errorHandling.errors}>
      <SDKFormProvider formHookResult={splitForm}>
        <Form onSubmit={handleSubmit}>
          {hasPercentageImbalance && (
            <Components.Alert
              status="error"
              label={t('validations.percentageErrorWithTotal', { total: percentageTotal })}
              disableScrollIntoView
            />
          )}
          <Components.Heading as="h2">{t('title')}</Components.Heading>
          <Trans t={t} i18nKey="splitDescription" components={{ p: <Components.Text /> }} />
          <Fields.SplitBy
            label={t('splitByLabel')}
            getOptionLabel={(value: SplitByValue) =>
              value === SPLIT_BY.percentage ? t('percentageLabel') : t('amountLabel')
            }
          />
          {splitBy === SPLIT_BY.amount ? (
            <ReorderableList
              key={`reorderable-amount-list-${splitBy}`}
              label={t('draggableListLabel')}
              items={Fields.splits.map(split => ({
                label: split.name ?? '',
                content: (
                  <split.Field
                    key={`amount-${split.uuid}`}
                    label={labelForSplit(split)}
                    min={0}
                    validationMessages={{
                      REQUIRED: t('validations.amountError'),
                      INVALID_AMOUNT: t('validations.amountError'),
                      INVALID_PERCENTAGE: t('validations.amountError'),
                    }}
                    placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
                  />
                ),
              }))}
              onReorder={handleReorder}
            />
          ) : (
            Fields.splits.map(split => (
              <split.Field
                key={`percentage-${split.uuid}`}
                label={labelForSplit(split)}
                min={0}
                validationMessages={{
                  REQUIRED: t('validations.percentageAmountError'),
                  INVALID_AMOUNT: t('validations.percentageAmountError'),
                  INVALID_PERCENTAGE: t('validations.percentageAmountError'),
                }}
              />
            ))
          )}
          <ActionsLayout>
            <Components.Button variant="secondary" type="button" onClick={handleCancel}>
              {t('cancelCta')}
            </Components.Button>
            <Components.Button type="submit" isLoading={splitForm.status.isPending}>
              {t('saveCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
