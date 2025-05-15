import { useTranslation } from 'react-i18next'
import { type HamburgerMenuProps } from './HamburgerMenuTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
// import HamburgerIcon from '@/assets/icons/hamburger.svg?react'
import { useMenu } from '@/components/Common/hooks/useMenu'

const HamburgerIcon = () => null

export function HamburgerMenu({
  items,
  triggerLabel,
  menuLabel,
  onClose,
  isLoading = false,
  ...props
}: HamburgerMenuProps) {
  const { t } = useTranslation('common')
  const Components = useComponentContext()
  const { triggerProps, menuProps } = useMenu()

  return (
    <>
      <Components.ButtonIcon
        isLoading={isLoading}
        aria-label={triggerLabel || t('labels.openMenu')}
        {...triggerProps}
      >
        <HamburgerIcon />
      </Components.ButtonIcon>
      <Components.Menu
        {...menuProps}
        items={items}
        aria-label={menuLabel || t('labels.menuLabel')}
        onClose={onClose || menuProps.onClose}
        {...props}
      />
    </>
  )
}
