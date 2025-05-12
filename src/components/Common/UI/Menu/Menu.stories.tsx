import { action } from '@ladle/react'
import { useMenu } from '@/components/Common/hooks/useMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Menu',
}

export const Default = () => {
  const Components = useComponentContext()
  const { triggerProps, menuProps } = useMenu()

  return (
    <>
      <button {...triggerProps}>Open Menu</button>
      <Components.Menu
        {...menuProps}
        aria-label="Edit options"
        items={[
          {
            label: 'Edit',
            icon: <PencilSvg aria-hidden />,
            onClick: () => {
              action('Edit clicked')()
            },
          },
          {
            label: 'Delete',
            icon: <TrashCanSvg aria-hidden />,
            onClick: () => {
              action('Delete clicked')()
            },
          },
        ]}
      />
    </>
  )
}

export const NoIcons = () => {
  const Components = useComponentContext()
  const { triggerProps, menuProps } = useMenu()

  return (
    <>
      <button {...triggerProps}>Open Menu</button>
      <Components.Menu
        {...menuProps}
        aria-label="File options"
        items={[
          {
            label: 'View',
            onClick: () => {
              action('View clicked')()
            },
          },
          {
            label: 'Download',
            onClick: () => {
              action('Download clicked')()
            },
          },
        ]}
      />
    </>
  )
}

export const WithHrefItems = () => {
  const Components = useComponentContext()
  const { triggerProps, menuProps } = useMenu()

  return (
    <>
      <button {...triggerProps}>Open Menu</button>
      <Components.Menu
        {...menuProps}
        aria-label="Links menu"
        items={[
          {
            label: 'Documentation',
            onClick: () => {},
            href: 'https://example.com/docs',
          },
          {
            label: 'GitHub',
            onClick: () => {},
            href: 'https://github.com',
          },
        ]}
      />
    </>
  )
}

export const WithDisabledItems = () => {
  const Components = useComponentContext()
  const { triggerProps, menuProps } = useMenu()

  return (
    <>
      <button {...triggerProps}>Open Menu</button>
      <Components.Menu
        {...menuProps}
        aria-label="Actions menu"
        items={[
          {
            label: 'Edit',
            icon: <PencilSvg aria-hidden />,
            isDisabled: true,
            onClick: () => {
              action('Edit clicked')()
            },
          },
          {
            label: 'Delete',
            icon: <TrashCanSvg aria-hidden />,
            onClick: () => {
              action('Delete clicked')()
            },
          },
        ]}
      />
    </>
  )
}
