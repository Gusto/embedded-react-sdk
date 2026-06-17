import type { ComponentType, ReactNode } from 'react'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Confirmation message shown after a wire-in request has been submitted.
 *
 * @internal
 */
export interface ConfirmationAlert {
  /** Alert title text. */
  title: string
  /** Optional supplemental content rendered beneath the title. */
  content?: ReactNode
}

/**
 * Props for the {@link ConfirmWireDetails} component.
 *
 * @public
 */
export interface ConfirmWireDetailsProps {
  /** The associated company identifier. */
  companyId: string
  /** Optional wire-in request identifier. If not provided, the first active wire-in request is used. */
  wireInId?: string
  /** Callback invoked with wire-confirmation lifecycle events. See the events table on {@link ConfirmWireDetails}. */
  onEvent?: BaseComponentInterface['onEvent']
}

/**
 * Component type matching the {@link ConfirmWireDetails} signature.
 *
 * Use this when supplying a custom wire-confirmation UI to a payroll flow via a
 * `ConfirmWireDetailsComponent` prop.
 *
 * @public
 */
export type ConfirmWireDetailsComponentType = ComponentType<ConfirmWireDetailsProps>
