import { useTranslation } from 'react-i18next'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useGarnishmentsUpdateMutation } from '@gusto/embedded-api/react-query/garnishmentsUpdate'
import { type Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { useDataView, DataView } from '@/components/Common'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import useNumberFormatter from '@/components/Common/hooks/useNumberFormatter'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'

interface DeductionsListProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function DeductionsList(props: DeductionsListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, children, employeeId, dictionary }: DeductionsListProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')
  const formatPercent = useNumberFormatter('percent')

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  const { data } = useGarnishmentsListSuspense({ employeeId })
  const deductions = data.garnishmentList!
  const activeDeductions = deductions.filter(deduction => deduction.active)

  const { mutateAsync: updateDeduction, isPending: isPendingUpdate } =
    useGarnishmentsUpdateMutation()

  const handleDelete = async (deduction: Garnishment) => {
    await baseSubmitHandler(deduction, async payload => {
      const { garnishment } = await updateDeduction({
        request: {
          garnishmentId: payload.uuid,
          requestBody: {
            ...payload,
            totalAmount: payload.totalAmount ?? undefined,
            active: false,
            version: payload.version as string,
          },
        },
      })
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED, garnishment)
    })
  }

  const handleEdit = (deduction: Garnishment) => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_EDIT, deduction)
  }

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD)
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }

  const { ...dataViewProps } = useDataView({
    data: activeDeductions,
    columns: [
      { key: 'description', title: t('nameColumn') },
      {
        key: 'recurring',
        title: t('frequencyColumn'),
        render: deduction => {
          return deduction.recurring ? t('recurringText') : t('nonRecurringText')
        },
      },
      {
        key: 'amount',
        title: t('withheldColumn'),
        render: deduction => {
          const formattedAmount = deduction.deductAsPercentage
            ? formatPercent(Number(deduction.amount))
            : formatCurrency(Number(deduction.amount))
          return deduction.recurring
            ? t('recurringAmount', { value: formattedAmount })
            : formattedAmount
        },
      },
    ],
    itemMenu: deduction => {
      return (
        <HamburgerMenu
          isLoading={isPendingUpdate}
          items={[
            {
              label: t('editCta'),
              onClick: () => {
                handleEdit(deduction)
              },
              icon: <PencilSvg aria-hidden />,
            },
            {
              label: t('deleteCta'),
              onClick: async () => {
                await handleDelete(deduction)
              },
              icon: <TrashCanSvg aria-hidden />,
            },
          ]}
        />
      )
    },
  })

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        {children ? (
          children
        ) : (
          <>
            <Components.Heading as="h2">{t('pageTitle')}</Components.Heading>
            <DataView label={t('deductionsTableLabel')} {...dataViewProps} />
            <ActionsLayout>
              <Components.Button variant="secondary" onClick={handleAdd}>
                {t('addDeductionCta')}
              </Components.Button>
              <Components.Button onClick={handleContinue}>{t('continueCta')}</Components.Button>
            </ActionsLayout>
          </>
        )}
      </Flex>
    </section>
  )
}
