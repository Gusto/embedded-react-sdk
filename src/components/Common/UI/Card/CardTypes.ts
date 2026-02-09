import type { ReactNode } from 'react'
import type { SelectionMode } from '@/components/Common/DataView/useDataView'

export interface CardProps {
  /**
   * Callback function when the card is selected
   */
  onSelect?: (checked: boolean) => void
  /**
   * Content to be displayed inside the card
   */
  children: ReactNode
  /**
   * Optional menu component to be displayed on the right side of the card
   */
  menu?: ReactNode
  /**
   * CSS className to be applied
   */
  className?: string
  /**
   * Selection mode: 'checkbox' for multi-select, 'radio' for single-select
   * @default 'checkbox'
   */
  selectionMode?: SelectionMode
  /**
   * Radio group name for radio selection mode (required when selectionMode is 'radio')
   */
  radioGroupName?: string
  /**
   * Whether this card is currently selected (used for radio mode)
   */
  isSelected?: boolean
}
