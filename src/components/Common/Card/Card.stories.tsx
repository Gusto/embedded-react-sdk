import { Flex } from '@/components/Common/Flex/Flex'
import { Hamburger, HamburgerItem } from '@/components/Common/Hamburger/Hamburger'
import { Card } from '@/components/Common/Card/Card'
import { Heading } from 'react-aria-components'

export const CardDefault = () => {
  return (
    <Card>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Job title
        </Heading>
        <div>Administrator</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay type
        </Heading>
        <div>By the hour</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Amount
        </Heading>
        <div>$32.00</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay time period
        </Heading>
        <div>Annually</div>
      </Flex>
    </Card>
  )
}

export const CardSelectable = () => {
  return (
    <Card onSelect={() => {}}>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Job title
        </Heading>
        <div>Administrator</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay type
        </Heading>
        <div>By the hour</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Amount
        </Heading>
        <div>$32.00</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay time period
        </Heading>
        <div>Annually</div>
      </Flex>
    </Card>
  )
}

export const CardWithMenu = () => {
  return (
    <Card
      menu={
        <Hamburger title={'Menu'}>
          <HamburgerItem>View</HamburgerItem>
          <HamburgerItem>Edit</HamburgerItem>
        </Hamburger>
      }
    >
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Job title
        </Heading>
        <div>Administrator</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay type
        </Heading>
        <div>By the hour</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Amount
        </Heading>
        <div>$32.00</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay time period
        </Heading>
        <div>Annually</div>
      </Flex>
    </Card>
  )
}

export const CardSelectableWithMenu = () => {
  return (
    <Card
      onSelect={() => {}}
      menu={
        <Hamburger title={'Menu'}>
          <HamburgerItem>View</HamburgerItem>
          <HamburgerItem>Edit</HamburgerItem>
        </Hamburger>
      }
    >
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Job title
        </Heading>
        <div>Administrator</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay type
        </Heading>
        <div>By the hour</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Amount
        </Heading>
        <div>$32.00</div>
      </Flex>
      <Flex flexDirection="column" gap={4}>
        <Heading
          style={{
            marginTop: 0,
          }}
          level={5}
        >
          Pay time period
        </Heading>
        <div>Annually</div>
      </Flex>
    </Card>
  )
}
