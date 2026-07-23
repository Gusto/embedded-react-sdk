import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddTaxRateDialog } from './AddTaxRateDialog'
import type { TaxRateKeyGroup } from './context'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface AddRateActionProps {
  state: string
  group: TaxRateKeyGroup
}

/**
 * "Add tax rate" button and its scheduling dialog for a single requirement-set key.
 *
 * @internal
 */
export function AddRateAction({ state, group }: AddRateActionProps) {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'manageRates' })
  const Components = useComponentContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const canAddRate = group.candidateSets.length > 0

  return (
    <>
      <Components.Button
        variant="primary"
        isDisabled={!canAddRate}
        onClick={() => {
          setIsDialogOpen(true)
        }}
      >
        {t('addRateCta')}
      </Components.Button>
      <AddTaxRateDialog
        isOpen={isDialogOpen}
        state={state}
        group={group}
        onClose={() => {
          setIsDialogOpen(false)
        }}
      />
    </>
  )
}
