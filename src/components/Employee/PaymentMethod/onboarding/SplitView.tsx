import { useFormState } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import {
  useSplitPaymentsForm,
  type SplitByValue,
  type UseSplitPaymentsFormProps,
  type UseSplitPaymentsFormReady,
  type WorkingSplit,
} from '../shared/useSplitPaymentsForm'
import { ActionsLayout, NumberInputField } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents, SPLIT_BY, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

export interface SplitViewProps extends Omit<UseSplitPaymentsFormProps, 'employeeId'> {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export function SplitView({ employeeId, onEvent, ...hookProps }: SplitViewProps) {
  const splitForm = useSplitPaymentsForm({ employeeId, ...hookProps })

  if (splitForm.isLoading) {
    return <BaseLayout isLoading error={splitForm.errorHandling.errors} />
  }

  return <SplitViewReady onEvent={onEvent} splitForm={splitForm} />
}

interface SplitViewReadyProps {
  onEvent: OnEventType<EventType, unknown>
  splitForm: UseSplitPaymentsFormReady
}

function SplitViewReady({ onEvent, splitForm }: SplitViewReadyProps) {
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()
  const { Fields } = splitForm.form
  const { splits, remainderId, splitBy, percentageTotal, bankAccounts } = splitForm.data

  const { errors } = useFormState({
    control: splitForm.form.hookFormInternals.formMethods.control,
  })
  // Zod produces the cross-field total-mismatch error at path ['splitAmount'].
  // react-hook-form lands path-level errors at .root when child fields are also
  // registered under the same key, so check both locations to be safe.
  const splitAmountError = errors.splitAmount as
    | { message?: string; root?: { message?: string } }
    | undefined
  const splitAmountErrorMessage = splitAmountError?.root?.message ?? splitAmountError?.message

  const handleSubmit = async () => {
    const result = await splitForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED, result.data)
    }
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  if (bankAccounts.length < 2) return null

  const labelForSplit = (split: WorkingSplit) =>
    t('splitAmountLabel', {
      name: DOMPurify.sanitize(split.name ?? ''),
      account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
      interpolation: { escapeValue: false },
    })

  return (
    <BaseLayout error={splitForm.errorHandling.errors}>
      <SDKFormProvider formHookResult={splitForm}>
        <Form onSubmit={handleSubmit}>
          {splitAmountErrorMessage === 'PERCENTAGE_TOTAL_MISMATCH' && (
            <Components.Alert
              status="error"
              label={t('validations.percentageErrorWithTotal', { total: percentageTotal })}
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
              items={splits.map(split => ({
                label: split.name ?? '',
                content: (
                  <NumberInputField
                    key={`amount-${split.uuid}`}
                    name={`splitAmount.${split.uuid}`}
                    label={labelForSplit(split)}
                    format="currency"
                    min={0}
                    isRequired
                    errorMessage={t('validations.amountError')}
                    placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
                    isDisabled={remainderId === split.uuid}
                    onChange={value => {
                      splitForm.actions.updateSplitAmount(split.uuid, value)
                    }}
                  />
                ),
              }))}
              onReorder={splitForm.actions.reorderSplits}
            />
          ) : (
            splits.map(split => (
              <NumberInputField
                key={`percentage-${split.uuid}`}
                name={`splitAmount.${split.uuid}`}
                label={labelForSplit(split)}
                format="percent"
                min={0}
                maximumFractionDigits={0}
                isRequired
                errorMessage={t('validations.percentageAmountError')}
                onChange={value => {
                  splitForm.actions.updateSplitAmount(split.uuid, value)
                }}
              />
            ))
          )}
          <ActionsLayout>
            <Components.Button variant="secondary" type="button" onClick={handleCancel}>
              {t('cancelAddCta')}
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
