import { useMemo } from 'react'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type {
  PostV1CompaniesCompanyIdContractorPaymentGroupsContractorPayments as ContractorPayments,
  PostV1CompaniesCompanyIdContractorPaymentGroupsPaymentMethod as ContractorPaymentMethod,
} from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import type { UsePaymentAmountsEditorReturn } from '../usePaymentAmountsEditor'
import { getContractorDisplayName } from '../../../shared/helpers'
import {
  EditContractorPaymentPresentation,
  type EditContractorPaymentDictionary,
} from './EditContractorPaymentPresentation'
import { DataView, Flex, EmptyData } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'

const ZERO_HOURS_DISPLAY = '0.000'

/**
 * Every string `SetPaymentAmounts` and its edit modal render. There is no default copy or
 * namespace of its own — `SetPaymentAmounts` is `@internal`, so each caller (`CreatePayment`,
 * `HistoricalPaymentAmounts`) must fully resolve this from its own public namespace and pass it
 * down, rather than this component owning a namespace that would show up in the SDK's public
 * translation types without ever being a real partner override surface.
 *
 * @internal
 */
export interface SetPaymentAmountsDictionary {
  hoursAndPaymentsLabel: string
  contractorTableHeaders: {
    contractor: string
    wageType: string
    paymentMethod: string
    hours: string
    wage: string
    bonus: string
    reimbursement: string
    total: string
  }
  emptyTableTitle: string
  emptyTableDescription: string
  na: string
  totalsLabel: string
  editContractor: string
  perHour: string
  editContractorPayment: EditContractorPaymentDictionary
}

/** @internal */
export interface SetPaymentAmountsProps {
  contractors: Contractor[]
  contractorPayments: (ContractorPayments & { isTouched?: boolean })[]
  totals: { wage: number; bonus: number; reimbursement: number; total: number }
  allowedPaymentMethods: ContractorPaymentMethod[]
  editModal: UsePaymentAmountsEditorReturn['editModal']
  /** Every string the grid and edit modal render, resolved by the caller from its own namespace. */
  dictionary: SetPaymentAmountsDictionary
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
  const { Heading } = useComponentContext()
  const currencyFormatter = useNumberFormatter('currency')

  const formatWageType = (contractor?: Contractor) => {
    if (!contractor) return ''
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return ` ${currencyFormatter(Number(contractor.hourlyRate || '0'))}${dictionary.perHour}`
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
      <Heading as="h3">{dictionary.hoursAndPaymentsLabel}</Heading>
      <DataView
        columns={[
          {
            title: dictionary.contractorTableHeaders.contractor,
            render: paymentData => getContractorDisplayName(paymentData.contractorDetails),
          },
          {
            title: dictionary.contractorTableHeaders.wageType,
            render: paymentData => formatWageType(paymentData.contractorDetails),
          },
          {
            title: dictionary.contractorTableHeaders.paymentMethod,
            render: paymentData => paymentData.paymentMethod || dictionary.na,
          },
          {
            title: dictionary.contractorTableHeaders.hours,
            justify: 'end',
            render: paymentData => {
              if (paymentData.contractorDetails?.wageType === 'Fixed') return dictionary.na
              const hours = Number(paymentData.hours || '0')
              return hours ? formatHoursDisplay(hours) : ZERO_HOURS_DISPLAY
            },
          },
          {
            title: dictionary.contractorTableHeaders.wage,
            justify: 'end',
            render: paymentData => {
              if (paymentData.contractorDetails?.wageType === 'Hourly') return dictionary.na
              return currencyFormatter(Number(paymentData.wage || '0'))
            },
          },
          {
            title: dictionary.contractorTableHeaders.bonus,
            justify: 'end',
            render: paymentData => currencyFormatter(Number(paymentData.bonus || '0')),
          },
          {
            title: dictionary.contractorTableHeaders.reimbursement,
            justify: 'end',
            render: paymentData => currencyFormatter(Number(paymentData.reimbursement || '0')),
          },
          {
            title: dictionary.contractorTableHeaders.total,
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
                'column-0': dictionary.totalsLabel,
                'column-4': currencyFormatter(totals.wage),
                'column-5': currencyFormatter(totals.bonus),
                'column-6': currencyFormatter(totals.reimbursement),
                'column-7': currencyFormatter(totals.total),
              })
            : undefined
        }
        label={dictionary.hoursAndPaymentsLabel}
        itemMenu={paymentData => (
          <HamburgerMenu
            items={[
              {
                label: dictionary.editContractor,
                onClick: () => {
                  editModal.open(paymentData.contractorUuid!)
                },
              },
            ]}
            triggerLabel={dictionary.editContractor}
          />
        )}
        emptyState={() => (
          <EmptyData
            title={dictionary.emptyTableTitle}
            description={dictionary.emptyTableDescription}
          />
        )}
      />
      <EditContractorPaymentPresentation
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        formMethods={editModal.formMethods}
        onSubmit={editModal.submit}
        allowedPaymentMethods={allowedPaymentMethods}
        contractorPaymentMethod={contractorPaymentMethod ?? undefined}
        dictionary={dictionary.editContractorPayment}
      />
    </Flex>
  )
}
