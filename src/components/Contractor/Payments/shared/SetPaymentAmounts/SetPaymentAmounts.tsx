import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type {
  PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { UsePaymentAmountsEditorReturn } from '../usePaymentAmountsEditor'
import { getContractorDisplayName } from '../../../shared/helpers'
import { EditContractorPaymentPresentation } from './EditContractorPaymentPresentation'
import { DataView, Flex, EmptyData } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentDictionary, useI18n } from '@/i18n'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import type { ResourceDictionary } from '@/types/Helpers'

const ZERO_HOURS_DISPLAY = '0.000'

/** @internal */
export type SetPaymentAmountsDictionary =
  ResourceDictionary<'Contractor.Payments.SetPaymentAmounts'>

/** @internal */
export interface SetPaymentAmountsProps {
  contractors: Contractor[]
  contractorPayments: (ContractorPayments & { isTouched?: boolean })[]
  totals: { wage: number; bonus: number; reimbursement: number; total: number }
  allowedPaymentMethods: ContractorPaymentMethod[]
  editModal: UsePaymentAmountsEditorReturn['editModal']
  /**
   * Translation overrides for the grid and edit modal. Each consuming screen
   * passes the dictionary it resolved from its own namespace so partner
   * overrides on that namespace flow into this shared surface.
   */
  dictionary?: SetPaymentAmountsDictionary
}

/** @internal */
export const SetPaymentAmounts = ({
  contractors,
  contractorPayments,
  totals,
  allowedPaymentMethods,
  editModal,
  dictionary,
}: SetPaymentAmountsProps) => {
  useI18n('Contractor.Payments.SetPaymentAmounts')
  useComponentDictionary('Contractor.Payments.SetPaymentAmounts', dictionary)
  const { t } = useTranslation('Contractor.Payments.SetPaymentAmounts')
  const { Heading } = useComponentContext()
  const currencyFormatter = useNumberFormatter('currency')

  const formatWageType = (contractor?: Contractor) => {
    if (!contractor) return ''
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return ` ${currencyFormatter(Number(contractor.hourlyRate || '0'))}${t('perHour')}`
    }
    return contractor.wageType
  }

  const tableData = useMemo(
    () =>
      contractorPayments.map(payment => ({
        ...payment,
        contractorDetails: contractors.find(
          contractor => contractor.uuid === payment.contractorUuid,
        ),
      })),
    [contractorPayments, contractors],
  )

  const editingContractorUuid = editModal.formMethods.getValues('contractorUuid')
  const contractorPaymentMethod = contractors.find(
    contractor => contractor.uuid === editingContractorUuid,
  )?.paymentMethod

  return (
    <Flex flexDirection="column" gap={16}>
      <Heading as="h3">{t('hoursAndPaymentsLabel')}</Heading>
      <DataView
        columns={[
          {
            title: t('contractorTableHeaders.contractor'),
            render: paymentData => getContractorDisplayName(paymentData.contractorDetails),
          },
          {
            title: t('contractorTableHeaders.wageType'),
            render: paymentData => formatWageType(paymentData.contractorDetails),
          },
          {
            title: t('contractorTableHeaders.paymentMethod'),
            render: paymentData => paymentData.paymentMethod || t('na'),
          },
          {
            title: t('contractorTableHeaders.hours'),
            justify: 'end',
            render: paymentData => {
              if (paymentData.contractorDetails?.wageType === 'Fixed') return t('na')
              const hours = Number(paymentData.hours || '0')
              return hours ? formatHoursDisplay(hours) : ZERO_HOURS_DISPLAY
            },
          },
          {
            title: t('contractorTableHeaders.wage'),
            justify: 'end',
            render: paymentData => {
              if (paymentData.contractorDetails?.wageType === 'Hourly') return t('na')
              return currencyFormatter(Number(paymentData.wage || '0'))
            },
          },
          {
            title: t('contractorTableHeaders.bonus'),
            justify: 'end',
            render: paymentData => currencyFormatter(Number(paymentData.bonus || '0')),
          },
          {
            title: t('contractorTableHeaders.reimbursement'),
            justify: 'end',
            render: paymentData => currencyFormatter(Number(paymentData.reimbursement || '0')),
          },
          {
            title: t('contractorTableHeaders.total'),
            justify: 'end',
            render: ({ bonus, reimbursement, wage, hours, contractorDetails }) => {
              const totalAmount =
                Number(bonus || '0') +
                Number(reimbursement || '0') +
                Number(wage || '0') +
                (contractorDetails?.wageType === 'Hourly' && hours
                  ? Number(hours || '0') * Number(contractorDetails.hourlyRate || '0')
                  : 0)
              return currencyFormatter(totalAmount)
            },
          },
        ]}
        data={tableData}
        footer={
          tableData.length > 0
            ? () => ({
                'column-0': t('totalsLabel'),
                'column-4': currencyFormatter(totals.wage),
                'column-5': currencyFormatter(totals.bonus),
                'column-6': currencyFormatter(totals.reimbursement),
                'column-7': currencyFormatter(totals.total),
              })
            : undefined
        }
        label={t('hoursAndPaymentsLabel')}
        itemMenu={paymentData => (
          <HamburgerMenu
            items={[
              {
                label: t('editContractor'),
                onClick: () => {
                  editModal.open(paymentData.contractorUuid!)
                },
              },
            ]}
            triggerLabel={t('editContractor')}
          />
        )}
        emptyState={() => (
          <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
        )}
      />
      <EditContractorPaymentPresentation
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        formMethods={editModal.formMethods}
        onSubmit={editModal.submit}
        allowedPaymentMethods={allowedPaymentMethods}
        contractorPaymentMethod={contractorPaymentMethod ?? undefined}
      />
    </Flex>
  )
}
