import { Heading } from 'react-aria-components'
import type { Story } from '@ladle/react'
import type { CardProps } from './CardTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { Hamburger, HamburgerItem } from '@/components/Common/Hamburger/Hamburger'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Components/Card',
}

const CardContent = () => (
  <>
    <Flex flexDirection="column" gap={4}>
      <Heading
        level={5}
        style={{
          marginTop: 0,
        }}
      >
        Job title
      </Heading>
      <div>Administrator</div>
    </Flex>
    <Flex flexDirection="column" gap={4}>
      <Heading
        level={5}
        style={{
          marginTop: 0,
        }}
      >
        Pay type
      </Heading>
      <div>By the hour</div>
    </Flex>
    <Flex flexDirection="column" gap={4}>
      <Heading
        level={5}
        style={{
          marginTop: 0,
        }}
      >
        Amount
      </Heading>
      <div>$32.00</div>
    </Flex>
    <Flex flexDirection="column" gap={4}>
      <Heading
        level={5}
        style={{
          marginTop: 0,
        }}
      >
        Pay time period
      </Heading>
      <div>Annually</div>
    </Flex>
  </>
)

const Template: Story<Omit<CardProps, 'children'>> = args => {
  const Components = useComponentContext()
  return (
    <Components.Card {...args}>
      <CardContent />
    </Components.Card>
  )
}

export const Default = Template.bind({})
Default.args = {}

export const Selectable = Template.bind({})
Selectable.args = {
  onSelect: () => {},
}

export const WithMenu = Template.bind({})
WithMenu.args = {
  menu: (
    <Hamburger title="Menu">
      <HamburgerItem>View</HamburgerItem>
      <HamburgerItem>Edit</HamburgerItem>
    </Hamburger>
  ),
}

export const SelectableWithMenu = Template.bind({})
SelectableWithMenu.args = {
  onSelect: () => {},
  menu: (
    <Hamburger title="Menu">
      <HamburgerItem>View</HamburgerItem>
      <HamburgerItem>Edit</HamburgerItem>
    </Hamburger>
  ),
}
