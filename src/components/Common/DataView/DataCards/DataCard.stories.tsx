import { Flex } from '@/components/Common/Flex/Flex'
import { Hamburger, HamburgerItem } from '@/components/Common/Hamburger/Hamburger'
import { DataCard } from '@/components/Common/DataView/DataCards/DataCard'
import { Heading } from 'react-aria-components'

export const DataCardDefault = () => {
  return (
    <DataCard
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
    </DataCard>
  )
}
