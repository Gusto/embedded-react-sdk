import type { StoryObj } from '@storybook/react-vite'
import type { CardProps } from './CardTypes'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { Checkbox } from '@/components/Common/UI/Checkbox/Checkbox'

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

const CardWrapper = (args: Omit<CardProps, 'children'>) => {
  const Components = useComponentContext()
  return (
    <Components.Card {...args}>
      <CardContent />
    </Components.Card>
  )
}

export default {
  title: 'UI/Components/Card',
  component: CardWrapper,
}

type Story = StoryObj<typeof CardWrapper>

export const Default: Story = {
  args: {},
}

export const WithAction: Story = {
  args: {
    action: <Checkbox onChange={() => {}} label="Select row" shouldVisuallyHideLabel />,
  },
}

export const WithMenu: Story = {
  args: {
    menu: <CardMenu />,
  },
}

export const WithActionAndMenu: Story = {
  args: {
    action: <Checkbox onChange={() => {}} label="Select row" shouldVisuallyHideLabel />,
    menu: <CardMenu />,
  },
}
