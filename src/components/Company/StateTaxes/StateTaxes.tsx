import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { stateTaxesStateMachine } from './stateTaxesStateMachine'
import type { StateTaxesContextInterface } from './StateTaxesComponents'
import { StateTaxesListContextual } from './StateTaxesComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

/**
 * Props for the {@link StateTaxes} flow.
 *
 * @public
 */
export interface StateTaxesProps extends BaseComponentInterface<'Company.StateTaxes'> {
  /** UUID of the company whose state taxes are being managed. */
  companyId: string
}

/**
 * Orchestrated flow for managing a company's state tax setup.
 *
 * @remarks
 * Switches internally between a list of states with tax requirements and a per-state edit form.
 * For finer-grained control over navigation, use the standalone {@link StateTaxesList} and
 * {@link StateTaxesForm} building blocks directly.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/stateTaxes/edit` | A state row was selected for editing | `{ state: string }` |
 * | `company/stateTaxes/updated` | State tax requirements were saved | — |
 * | `company/stateTaxes/done` | The list view was completed | — |
 * | `CANCEL` | Editing was cancelled and the form was closed | — |
 *
 * @param props - {@link StateTaxesProps}
 * @returns The rendered state taxes flow.
 * @public
 */
export function StateTaxes({ companyId, onEvent, dictionary }: StateTaxesProps) {
  useComponentDictionary('Company.StateTaxes', dictionary)
  const manageStateTaxes = useMemo(
    () =>
      createMachine(
        'viewStateTaxes',
        stateTaxesStateMachine,
        (initialContext: StateTaxesContextInterface) => ({
          ...initialContext,
          component: StateTaxesListContextual,
          companyId,
        }),
      ),
    [companyId],
  )
  return <Flow machine={manageStateTaxes} onEvent={onEvent} />
}
