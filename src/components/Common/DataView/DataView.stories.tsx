import { Hamburger, HamburgerItem } from '../Hamburger/Hamburger'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PencilSvg from '@/assets/icons/pencil.svg?react'

// Adding a meta object for title
export default {
  title: 'UI/Components/DataView', // Creates nesting structure for UI components
}

const compensationData = [
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  { jobTitle: 'Key Holder', payType: 'By the hour', amount: '$20.00', payTimePeriod: 'Annually' },
  {
    jobTitle: 'Administrator',
    payType: 'By the hour',
    amount: '$32.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Key Holder',
    payType: 'By the hour',
    amount: '$20.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Software Engineer',
    payType: 'By the hour',
    amount: '$45.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Project Manager',
    payType: 'By the hour',
    amount: '$50.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Data Analyst',
    payType: 'By the hour',
    amount: '$38.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Sales Associate',
    payType: 'By the hour',
    amount: '$15.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Graphic Designer',
    payType: 'By the project',
    amount: '$2,000.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Marketing Specialist',
    payType: 'By the hour',
    amount: '$35.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Customer Service Representative',
    payType: 'By the hour',
    amount: '$18.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'UX/UI Designer',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Network Administrator',
    payType: 'By the hour',
    amount: '$42.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Content Writer',
    payType: 'By the word',
    amount: '$0.15',
    payTimePeriod: 'Per word',
  },
  {
    jobTitle: 'Data Scientist',
    payType: 'By the hour',
    amount: '$55.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Web Developer',
    payType: 'By the project',
    amount: '$3,500.00',
    payTimePeriod: 'Per project',
  },
  {
    jobTitle: 'Human Resources Manager',
    payType: 'By the hour',
    amount: '$48.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Accountant',
    payType: 'By the hour',
    amount: '$40.00',
    payTimePeriod: 'Annually',
  },
  {
    jobTitle: 'Legal Advisor',
    payType: 'By the hour',
    amount: '$100.00',
    payTimePeriod: 'Annually',
  },
]

export const DataViewDefault = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
  })

  return <DataView label="Data View Default" {...dataProps} />
}

export const DataViewSelectable = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    onSelect: item => {},
  })

  return <DataView label="Data View Selectable" {...dataProps} />
}

export const DataViewWithMenu = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: item => {
      return (
        <Hamburger title={'Actions'}>
          <HamburgerItem icon={<PencilSvg aria-hidden />} onAction={() => {}}>
            Edit
          </HamburgerItem>
          <HamburgerItem icon={<TrashCanSvg aria-hidden />} onAction={() => {}}>
            Delete
          </HamburgerItem>
        </Hamburger>
      )
    },
  })

  return <DataView label="Data View with Menu" {...dataProps} />
}

export const DataViewSelectableWithMenu = () => {
  const { ...dataProps } = useDataView({
    data: compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    itemMenu: item => {
      return (
        <Hamburger title={'Actions'}>
          <HamburgerItem icon={<PencilSvg aria-hidden />} onAction={() => {}}>
            Edit
          </HamburgerItem>
          <HamburgerItem icon={<TrashCanSvg aria-hidden />} onAction={() => {}}>
            Delete
          </HamburgerItem>
        </Hamburger>
      )
    },
    onSelect: item => {},
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}

export const DataViewEmpty = () => {
  const { ...dataProps } = useDataView({
    data: [] as typeof compensationData,
    columns: [
      { key: 'jobTitle', title: 'Job Title' },
      { key: 'payType', title: 'Pay Type' },
      { key: 'amount', title: 'Amount' },
      { key: 'payTimePeriod', title: 'Pay Time Period' },
    ],
    emptyState: () => <div style={{ textAlign: 'center', padding: '1rem' }}>No data available</div>,
  })

  return <DataView label="Data View Selectable with Menu" {...dataProps} />
}
