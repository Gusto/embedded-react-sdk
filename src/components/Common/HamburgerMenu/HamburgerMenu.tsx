import { useTranslation } from 'react-i18next'
import { type HamburgerMenuProps } from './HamburgerMenuTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import HamburgerIcon from '@/assets/icons/hamburger.svg?react'
import { useMenu } from '@/components/Common/hooks/useMenu'

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

  const { ref, ...restTriggerProps } = triggerProps

  return (
    <>
      <Components.ButtonIcon
        isLoading={isLoading}
        aria-label={triggerLabel || t('labels.openMenu')}
        buttonRef={ref}
        {...restTriggerProps}
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
