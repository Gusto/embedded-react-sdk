import { useState } from 'react'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { DeductionsForm } from './DeductionsForm/DeductionsForm'
import { DeductionsList } from './DeductionsList/DeductionsList'
import { IncludeDeductions } from './IncludeDeductions/IncludeDeductions'
import { useDeductionsList } from './shared/useDeductionsList'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

type View = { kind: 'add' } | { kind: 'edit'; deductionId: string } | null

export interface DeductionsProps extends BaseComponentInterface<'Employee.Deductions'> {
  employeeId: string
}

export function Deductions({ employeeId, dictionary, onEvent }: DeductionsProps) {
  return (
    <BaseBoundaries componentName="Employee.Deductions">
      <DeductionsRoot employeeId={employeeId} dictionary={dictionary} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

interface DeductionsRootProps {
  employeeId: string
  dictionary?: BaseComponentInterface<'Employee.Deductions'>['dictionary']
  onEvent: OnEventType<EventType, unknown>
}

function DeductionsRoot({ employeeId, dictionary, onEvent }: DeductionsRootProps) {
  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  const deductionsList = useDeductionsList({ employeeId })
  const [view, setView] = useState<View>(null)

  if (deductionsList.isLoading) {
    return <BaseLayout isLoading error={deductionsList.errorHandling.errors} />
  }

  const { deductions } = deductionsList.data

  // The user's explicit `view` state wins; otherwise we derive from the list
  // — non-empty → list, empty → include-deductions CTA. "Delete the last row"
  // naturally falls back to the include CTA, and "save the first row from
  // include" falls forward to the list, all without an explicit setView call.
  const autoView: 'list' | 'include' = deductions.length > 0 ? 'list' : 'include'

  // Look up the deduction object for edit mode from the already-fetched list.
  // React Query dedupes with the form hook's own list query.
  const editingDeduction =
    view?.kind === 'edit' ? (deductions.find(d => d.uuid === view.deductionId) ?? null) : null

  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD)
    setView({ kind: 'add' })
  }

  const handleAddFromInclude = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
    setView({ kind: 'add' })
  }

  const handleEdit = (deduction: Garnishment) => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_EDIT, deduction)
    setView({ kind: 'edit', deductionId: deduction.uuid as string })
  }

  const handleDelete = async (deduction: Garnishment) => {
    const result = await deductionsList.actions.onDelete(deduction)
    if (!result) return
    if (result.data.remainingActiveCount === 0) {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED_EMPTY)
    } else {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED, result.data.garnishment)
    }
  }

  const handleContinueFromList = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }

  const handleContinueFromInclude = () => {
    // The legacy inner state machine routed INCLUDE_NO through a terminal
    // state that also fired DONE; partners (and the outer onboarding flow)
    // expect DONE to advance the flow. Emit both to preserve the contract.
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }

  const handleFormSaved = (saved: Garnishment, mode: 'create' | 'update') => {
    onEvent(
      mode === 'create'
        ? componentEvents.EMPLOYEE_DEDUCTION_CREATED
        : componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      saved,
    )
    setView(null) // fall back to auto-derived view
  }

  const handleFormCancel = () => {
    if (deductions.length > 0) {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
    } else {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY)
    }
    setView(null)
  }

  if (view?.kind === 'add' || view?.kind === 'edit') {
    return (
      <BaseLayout error={deductionsList.errorHandling.errors}>
        <DeductionsForm
          employeeId={employeeId}
          deduction={editingDeduction}
          onSaved={handleFormSaved}
          onCancel={handleFormCancel}
        />
      </BaseLayout>
    )
  }

  if (autoView === 'list') {
    return (
      <BaseLayout error={deductionsList.errorHandling.errors}>
        <DeductionsList
          deductionsList={deductionsList}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={(d: Garnishment) => {
            void handleDelete(d)
          }}
          onContinue={handleContinueFromList}
        />
      </BaseLayout>
    )
  }

  return (
    <BaseLayout error={deductionsList.errorHandling.errors}>
      <IncludeDeductions onAdd={handleAddFromInclude} onContinue={handleContinueFromInclude} />
    </BaseLayout>
  )
}
