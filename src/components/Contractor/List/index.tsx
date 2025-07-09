import { type Contractor } from '@gusto/embedded-api/models/components/contractor'
import { useTranslation } from 'react-i18next'
import { useContractors } from './useContractorList'
import { ActionsLayout, DataView, EmptyData, Flex, Grid, useDataView } from '@/components/Common'
import { firstLastName } from '@/helpers/formattedStrings'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ContractorOnboardingStatusBadge } from '@/components/Common/OnboardingStatusBadge'
import { useI18n } from '@/i18n'

export type ContractorListDisplay = Pick<
  Contractor,
  'onboardingStatus' | 'firstName' | 'lastName' | 'onboarded'
>

export interface HeadProps {
  count: number
  handleAdd: () => void
}
export function Head({ count, handleAdd }: HeadProps) {
  const { Button, Heading } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Heading as="h2">{t('title')}</Heading>

      {count !== 0 && (
        <Button variant="secondary" onClick={handleAdd}>
          {t('addAnotherCTA')}
        </Button>
      )}
    </Flex>
  )
}

export interface EmptyDataContractorsListProps {
  handleAdd: () => void
}
export function EmptyDataContractorsList({ handleAdd }: EmptyDataContractorsListProps) {
  const { Button } = useComponentContext()
  const { t } = useTranslation('Contractor.ContractorList')

  return (
    <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')}>
      <ActionsLayout justifyContent="center">
        <Button onClick={handleAdd}>{t('addContractorCTA')}</Button>
      </ActionsLayout>
    </EmptyData>
  )
}

export interface ContractorListProps {
  contractors: ContractorListDisplay[]
  handleAdd: () => void
  handleEdit: () => void
  totalCount: number
}

export function ContractorList({
  contractors,
  handleAdd,
  handleEdit,
  totalCount,
}: ContractorListProps) {
  useI18n('Contractor.ContractorList')
  const { t } = useTranslation('Contractor.ContractorList')

  const dataViewProps = useDataView<ContractorListDisplay>({
    columns: [
      {
        title: t('listHeaders.name'),
        render: contractor =>
          firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName }),
      },
      {
        title: t('listHeaders.status'),
        render: ({ onboarded, onboardingStatus }) => (
          <ContractorOnboardingStatusBadge
            onboarded={onboarded}
            onboardingStatus={onboardingStatus}
          />
        ),
      },
    ],
    data: contractors,
    itemMenu: () => (
      <HamburgerMenu
        items={[{ label: t('editCTA'), icon: <PencilSvg aria-hidden />, onClick: handleEdit }]}
        triggerLabel={t('editCTA')}
        isLoading={false}
      />
    ),
    emptyState: () => <EmptyDataContractorsList handleAdd={handleAdd} />,
  })

  return (
    <Grid gap={20}>
      <Head count={totalCount} handleAdd={handleAdd} />
      <DataView label={t('contractorListLabel')} {...dataViewProps} />
    </Grid>
  )
}

export interface ContractorListWithApiProps {
  companyId: string
  handleAdd: () => void
  handleEdit: () => void
}

export function ContractorListWithApi({
  companyId,
  handleAdd,
  handleEdit,
}: ContractorListWithApiProps) {
  const contractorProps = useContractors({ companyUuid: companyId, handleAdd })

  return <ContractorList handleEdit={handleEdit} {...contractorProps} />
}
