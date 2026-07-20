import { Trans, useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import type { EmployeePaymentMethod } from '@gusto/embedded-api/models/components/employeepaymentmethod'
import {
  useSplitPaymentsForm,
  type SplitByValue,
  type SplitFieldEntry,
  type UseSplitPaymentsFormProps,
  type UseSplitPaymentsFormReady,
} from '../useSplitPaymentsForm'
import { ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { SPLIT_BY } from '@/shared/constants'
import type { ResourceDictionary } from '@/types/Helpers'

/** @internal */
export type SplitPaymentsFormBodyDictionary = ResourceDictionary<'Employee.SplitPaymentsFormBody'>

/** @internal */
export interface SplitPaymentsFormBodyProps extends UseSplitPaymentsFormProps {
  /**
   * Translation overrides for the form's strings. Each consuming surface passes
   * the dictionary it resolved from its own namespace so partner overrides on
   * that namespace flow into the shared form text.
   */
  dictionary?: SplitPaymentsFormBodyDictionary
  /** Called with the updated payment method after a successful submit. */
  onSaved: (paymentMethod: EmployeePaymentMethod) => void
  onCancel: () => void
}

/**
 * Shared split-paycheck form body. Owns the `useSplitPaymentsForm` composition,
 * the reorderable-list/percentage field JSX, and the submit/cancel actions.
 * Reads its copy from the internal `Employee.SplitPaymentsFormBody` namespace;
 * consuming surfaces inject their own copy via the `dictionary` prop and map the
 * `onSaved`/`onCancel` callbacks onto their surface-specific events.
 *
 * @internal
 */
export function SplitPaymentsFormBody({
  dictionary,
  onSaved,
  onCancel,
  ...hookProps
}: SplitPaymentsFormBodyProps) {
  useI18n('Employee.SplitPaymentsFormBody')
  useComponentDictionary('Employee.SplitPaymentsFormBody', dictionary)
  const splitForm = useSplitPaymentsForm(hookProps)

  if (splitForm.isLoading) {
    return <BaseLayout isLoading error={splitForm.errorHandling.errors} />
  }

  return <SplitPaymentsFormBodyReady onSaved={onSaved} onCancel={onCancel} splitForm={splitForm} />
}

interface SplitPaymentsFormBodyReadyProps {
  onSaved: (paymentMethod: EmployeePaymentMethod) => void
  onCancel: () => void
  splitForm: UseSplitPaymentsFormReady
}

function SplitPaymentsFormBodyReady({
  onSaved,
  onCancel,
  splitForm,
}: SplitPaymentsFormBodyReadyProps) {
  const { t } = useTranslation('Employee.SplitPaymentsFormBody')
  const Components = useComponentContext()
  const { Fields } = splitForm.form
  const { remainderId, bankAccounts } = splitForm.data
  const { splitBy, percentageTotal, hasPercentageImbalance } = splitForm.status

  const handleSubmit = async () => {
    const result = await splitForm.actions.onSubmit()
    if (result) {
      onSaved(result.data)
    }
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
            <Components.Button variant="secondary" type="button" onClick={onCancel}>
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
