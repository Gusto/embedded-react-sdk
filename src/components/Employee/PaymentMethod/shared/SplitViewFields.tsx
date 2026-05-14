import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import { NumberInputField } from '@/components/Common'
import { ReorderableList } from '@/components/Common/ReorderableList'
import { SPLIT_BY } from '@/shared/constants'

export type WorkingSplit = {
  uuid: string
  name?: string | null
  hiddenAccountNumber?: string | null
}

function AmountField({
  split,
  remainderId,
  onChange,
}: {
  split: WorkingSplit
  remainderId: string
  onChange: (value: number | null) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="currency"
      min={0}
      isRequired
      errorMessage={t('validations.amountError')}
      placeholder={remainderId === split.uuid ? t('remainderLabel') : ''}
      isDisabled={remainderId === split.uuid}
      onChange={onChange}
    />
  )
}

function PercentageField({
  split,
  onChange,
}: {
  split: WorkingSplit
  onChange: (value: number) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <NumberInputField
      name={`splitAmount.${split.uuid}`}
      label={t('splitAmountLabel', {
        name: DOMPurify.sanitize(split.name ?? ''),
        account_number: DOMPurify.sanitize(split.hiddenAccountNumber ?? ''),
        interpolation: { escapeValue: false },
      })}
      format="percent"
      min={0}
      maximumFractionDigits={0}
      isRequired
      errorMessage={t('validations.percentageAmountError')}
      onChange={onChange}
    />
  )
}

export function SplitFieldsList({
  splits,
  splitBy,
  remainderId,
  onUpdateAmount,
  onReorder,
}: {
  splits: WorkingSplit[]
  splitBy: string | undefined
  remainderId: string
  onUpdateAmount: (uuid: string, value: number | null) => void
  onReorder: (newOrder: number[]) => void
}) {
  const { t } = useTranslation('Employee.PaymentMethod')
  if (splitBy === SPLIT_BY.amount) {
    return (
      <ReorderableList
        key={`reorderable-amount-list-${splitBy}`}
        label={t('draggableListLabel')}
        items={splits.map(split => ({
          label: split.name ?? '',
          content: (
            <AmountField
              key={`amount-${split.uuid}`}
              split={split}
              onChange={value => {
                onUpdateAmount(split.uuid, value)
              }}
              remainderId={remainderId}
            />
          ),
        }))}
        onReorder={onReorder}
      />
    )
  }
  return (
    <>
      {splits.map(split => (
        <PercentageField
          key={`percentage-${split.uuid}`}
          split={split}
          onChange={value => {
            onUpdateAmount(split.uuid, value)
          }}
        />
      ))}
    </>
  )
}
