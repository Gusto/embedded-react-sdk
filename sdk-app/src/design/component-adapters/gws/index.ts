import 'bootstrap/dist/css/bootstrap.min.css'
import './gws-overrides.scss'
import { GwsBox } from './GwsBox'
import { GwsButton } from './GwsButton'
import { GwsButtonIcon } from './GwsButtonIcon'
import { GwsHeading } from './GwsHeading'
import { GwsTable } from './GwsTable'
import { GwsTabs } from './GwsTabs'
import { GwsText } from './GwsText'
import type { ComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'

export const gwsComponentOverrides: Partial<ComponentsContextType> = {
  Box: GwsBox,
  Button: GwsButton,
  ButtonIcon: GwsButtonIcon,
  Heading: GwsHeading,
  Table: GwsTable,
  Tabs: GwsTabs,
  Text: GwsText,
}
