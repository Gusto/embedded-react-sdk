import type { Story } from '@ladle/react'
import type { CardProps } from './CardTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
export default {
  title: 'UI/Components/Card',
}

function CardContent() {
  const Components = useComponentContext()
  return (
    <>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h5" styledAs="h6">
          Job title
        </Components.Heading>
        <div>Administrator</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h5" styledAs="h6">
          Pay type
        </Components.Heading>
        <div>By the hour</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h5" styledAs="h6">
          Amount
        </Components.Heading>
        <div>$32.00</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h5" styledAs="h6">
          Pay time period
        </Components.Heading>
        <div>Annually</div>
      </Flex>
    </>
  )
}

const CardMenu = () => {
  return (
    <HamburgerMenu
      items={[
        { label: 'View', onClick: () => {} },
        { label: 'Edit', onClick: () => {} },
      ]}
    />
  )
}

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
  menu: <CardMenu />,
}

export const SelectableWithMenu = Template.bind({})
SelectableWithMenu.args = {
  onSelect: () => {},
  menu: <CardMenu />,
}
