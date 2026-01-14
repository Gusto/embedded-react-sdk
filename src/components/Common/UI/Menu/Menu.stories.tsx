import { fn } from 'storybook/test'
import { useMenu } from '@/hooks/useMenu'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Menu',
}

const editAction = fn().mockName('Edit clicked')
const deleteAction = fn().mockName('Delete clicked')
const viewAction = fn().mockName('View clicked')
const downloadAction = fn().mockName('Download clicked')

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
            onClick: editAction,
          },
          {
            label: 'Delete',
            icon: <TrashCanSvg aria-hidden />,
            onClick: deleteAction,
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
            onClick: viewAction,
          },
          {
            label: 'Download',
            onClick: downloadAction,
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
            onClick: editAction,
          },
          {
            label: 'Delete',
            icon: <TrashCanSvg aria-hidden />,
            onClick: deleteAction,
          },
        ]}
      />
    </>
  )
}
