import { HamburgerMenu } from '@/components/Common/UI/HamburgerMenu'
import type { HamburgerMenuProps } from '@/components/Common/UI/HamburgerMenu/HamburgerMenuTypes'
import type { InternalComponentsContextType } from '@/contexts/ComponentAdapter/useComponentContext'

export const internalComponents: InternalComponentsContextType = {
  HamburgerMenu: (props: HamburgerMenuProps) => <HamburgerMenu {...props} />,
}
