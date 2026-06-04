import { type Garnishment } from '@gusto/embedded-api-v-2025-11-15/models/components/garnishment'
import { useDeductionsList } from '../shared/useDeductionsList'
import { DeductionsForm } from '../shared/DeductionsForm'
import { IncludeDeductions } from './IncludeDeductions/IncludeDeductions'
import { DeductionsList } from './DeductionsList/DeductionsList'
import { useOnboardingDeductionsFormDictionary } from './useFormDictionary'
import { BaseLayout } from '@/components/Base/Base'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_ADD]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_EDIT]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_CANCEL]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_CREATED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_UPDATED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_DELETED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_DELETED_EMPTY]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_DONE]: undefined
}

export interface DeductionsContextInterface extends FlowContextInterface {
  employeeId: string
  /** Set by the EDIT transition; consumed by the form-mode contextual. */
  editingDeductionId?: string
}

export function IncludeDeductionsContextual() {
  const { onEvent } = useFlow<DeductionsContextInterface>()

  const onAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
  }
  const onContinue = () => {
    // The outer onboarding flow advances on DONE; partners also receive
    // INCLUDE_NO so analytics can distinguish the empty-state confirmation.
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO)
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }

  // BaseLayout's inner FadeIn (width: 100%) is the canonical "page" container
  // for content rendered inside <Flow>. Without it the outer row-direction
  // Flex in Flow collapses to the intrinsic content width of its single
  // child, producing the "squashed" layout for narrow content.
  return (
    <BaseLayout>
      <IncludeDeductions onAdd={onAdd} onContinue={onContinue} />
    </BaseLayout>
  )
}

export function DeductionsListContextual() {
  const { employeeId, onEvent } = useFlow<DeductionsContextInterface>()
  const list = useDeductionsList({ employeeId: ensureRequired(employeeId) })

  if (list.isLoading) {
    return <BaseLayout isLoading error={list.errorHandling.errors} />
  }

  const onAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_ADD)
  }
  const onEdit = (deduction: Garnishment) => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_EDIT, deduction)
  }
  const onContinue = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
  }
  const onDelete = async (deduction: Garnishment) => {
    const result = await list.actions.onDelete(deduction)
    if (!result) return
    if (result.data.remainingActiveCount === 0) {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED_EMPTY)
    } else {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED, result.data.garnishment)
    }
  }

  return (
    <BaseLayout error={list.errorHandling.errors}>
      <DeductionsList
        deductionsList={list}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={(d: Garnishment) => {
          void onDelete(d)
        }}
        onContinue={onContinue}
      />
    </BaseLayout>
  )
}

export function DeductionsFormContextual() {
  const { employeeId, editingDeductionId, onEvent } = useFlow<DeductionsContextInterface>()
  // The same list query the form hooks use internally — React Query dedupes
  // so this is the only outstanding request.
  const list = useDeductionsList({ employeeId: ensureRequired(employeeId) })
  const formDictionary = useOnboardingDeductionsFormDictionary()

  if (list.isLoading) {
    return <BaseLayout isLoading error={list.errorHandling.errors} />
  }

  const deduction = editingDeductionId
    ? (list.data.deductions.find(d => d.uuid === editingDeductionId) ?? null)
    : null
  const hasActiveDeductions = list.data.deductions.length > 0

  const onSaved = (saved: Garnishment, mode: 'create' | 'update') => {
    onEvent(
      mode === 'create'
        ? componentEvents.EMPLOYEE_DEDUCTION_CREATED
        : componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      saved,
    )
  }
  const onCancel = () => {
    onEvent(
      hasActiveDeductions
        ? componentEvents.EMPLOYEE_DEDUCTION_CANCEL
        : componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY,
    )
  }

  return (
    <BaseLayout error={list.errorHandling.errors}>
      <DeductionsForm
        employeeId={ensureRequired(employeeId)}
        deduction={deduction}
        formDictionary={formDictionary}
        onSaved={onSaved}
        onCancel={onCancel}
      />
    </BaseLayout>
  )
}
