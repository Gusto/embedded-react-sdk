import { Flex } from '@/components/Common/Flex/Flex'
import { SignatoryCard } from '@/components/Company/AssignSignatory/management/SignatoryCard'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link DocumentsView}.
 *
 * @internal
 */
export interface DocumentsViewProps {
  /** The associated company identifier. */
  companyId: string
  /** Event handler invoked when the inner cards emit events. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator forwarded to each card. */
  LoaderComponent?: LoaderComponentType
}

/**
 * Layout container for the Documents tab of the company settings dashboard.
 *
 * @remarks
 * Renders the company's document-related cards stacked vertically, starting with
 * who is authorized to sign for the company. Each card is a self-fetching
 * surface that owns its own data fetch and event emission; this container only
 * forwards `companyId` and `onEvent`.
 *
 * @param props - See {@link DocumentsViewProps}.
 * @returns The stacked card layout for the Documents tab.
 * @internal
 */
export function DocumentsView({ companyId, onEvent, LoaderComponent }: DocumentsViewProps) {
  return (
    <Flex flexDirection="column" gap={24}>
      <SignatoryCard companyId={companyId} onEvent={onEvent} LoaderComponent={LoaderComponent} />
    </Flex>
  )
}
