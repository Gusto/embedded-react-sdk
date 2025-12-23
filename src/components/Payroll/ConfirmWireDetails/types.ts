import type { ComponentType, ReactNode } from 'react'
import type { BaseComponentInterface } from '@/components/Base'

export interface ConfirmationAlert {
  title: string
  content?: ReactNode
}

export interface ConfirmWireDetailsProps {
  companyId: string
  wireInId?: string
  onEvent?: BaseComponentInterface['onEvent']
}

export type ConfirmWireDetailsComponentType = ComponentType<ConfirmWireDetailsProps>
