import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PolicyListPresentationProps, PolicyListItem } from './PolicyListTypes'
import styles from './PolicyListPresentation.module.scss'
import {
  DataView,
  Flex,
  EmptyData,
  ActionsLayout,
  HamburgerMenu,
  useDataView,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export function PolicyListPresentation({
  policies,
  onCreatePolicy,
  onEditPolicy,
  onFinishSetup,
  onDeletePolicy,
  deleteSuccessAlert,
  onDismissDeleteAlert,
  isDeletingPolicyId,
}: PolicyListPresentationProps) {
  const { Button, Heading, Text, Alert, Dialog } = useComponentContext()
  useI18n('Company.TimeOff.TimeOffPolicies')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicies')

  const [deletePolicyDialogState, setDeletePolicyDialogState] = useState<{
    isOpen: boolean
    policy: PolicyListItem | null
  }>({
    isOpen: false,
    policy: null,
  })

  const handleOpenDeleteDialog = (policy: PolicyListItem) => {
    setDeletePolicyDialogState({ isOpen: true, policy })
  }

  const handleCloseDeleteDialog = () => {
    setDeletePolicyDialogState({ isOpen: false, policy: null })
  }

  const handleConfirmDelete = () => {
    if (deletePolicyDialogState.policy) {
      onDeletePolicy(deletePolicyDialogState.policy)
      handleCloseDeleteDialog()
    }
  }

  const { ...dataViewProps } = useDataView({
    data: policies,
    columns: [
      {
        title: t('tableHeaders.name'),
        render: (policy: PolicyListItem) => <Text weight="medium">{policy.name}</Text>,
      },
      {
        title: t('tableHeaders.enrolled'),
        render: (policy: PolicyListItem) => (
          <Text variant="supporting">{policy.enrolledDisplay}</Text>
        ),
      },
    ],
    itemMenu: (policy: PolicyListItem) => {
      const isDeleting = isDeletingPolicyId === policy.uuid

      return (
        <div className={styles.actionsCell}>
          {!policy.isComplete && (
            <Button variant="secondary" onClick={() => { onFinishSetup(policy); }}>
              {t('finishSetupCta')}
            </Button>
          )}
          <HamburgerMenu
            isLoading={isDeleting}
            menuLabel={t('tableLabel')}
            items={[
              {
                label: t('actions.editPolicy'),
                onClick: () => { onEditPolicy(policy); },
              },
              {
                label: t('actions.deletePolicy'),
                onClick: () => { handleOpenDeleteDialog(policy); },
              },
            ]}
          />
        </div>
      )
    },
    emptyState: () => (
      <EmptyData title={t('emptyState.heading')} description={t('emptyState.body')}>
        <ActionsLayout justifyContent="center">
          <Button variant="secondary" onClick={onCreatePolicy}>
            {t('createPolicyCta')}
          </Button>
        </ActionsLayout>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={16}>
      {deleteSuccessAlert && (
        <Alert status="success" label={deleteSuccessAlert} onDismiss={onDismissDeleteAlert} />
      )}

      <Flex
        flexDirection={{ base: 'column', medium: 'row' }}
        justifyContent="space-between"
        alignItems="flex-start"
        gap={{ base: 12, medium: 24 }}
      >
        <Heading as="h2">{t('pageTitle')}</Heading>
        {policies.length > 0 && (
          <Button variant="primary" onClick={onCreatePolicy}>
            {t('createPolicyCta')}
          </Button>
        )}
      </Flex>

      <DataView label={t('tableLabel')} {...dataViewProps} />

      <Dialog
        isOpen={deletePolicyDialogState.isOpen}
        onClose={handleCloseDeleteDialog}
        onPrimaryActionClick={handleConfirmDelete}
        isDestructive
        title={t('deletePolicyDialog.title', {
          name: deletePolicyDialogState.policy?.name ?? '',
        })}
        primaryActionLabel={t('deletePolicyDialog.confirmCta')}
        closeActionLabel={t('deletePolicyDialog.cancelCta')}
      >
        {t('deletePolicyDialog.description', {
          name: deletePolicyDialogState.policy?.name ?? '',
        })}
      </Dialog>
    </Flex>
  )
}
