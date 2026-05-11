import { fn } from 'storybook/test'
import { PolicyListPresentation } from './PolicyListPresentation'
import type { PolicyListItem } from './PolicyListTypes'

export default {
  title: 'Domain/TimeOff/PolicyList',
}

const onCreatePolicy = fn().mockName('onCreatePolicy')
const onEditPolicy = fn().mockName('onEditPolicy')
const onFinishSetup = fn().mockName('onFinishSetup')
const onDeletePolicy = fn().mockName('onDeletePolicy')
const onDismissDeleteAlert = fn().mockName('onDismissDeleteAlert')

const completePolicies: PolicyListItem[] = [
  {
    uuid: 'policy-1',
    name: 'Paid Time Off Policy',
    policyType: 'vacation',
    isComplete: true,
    enrolledDisplay: 'All employees',
  },
  {
    uuid: 'policy-2',
    name: 'Sick Policy',
    policyType: 'sick',
    isComplete: true,
    enrolledDisplay: '16',
  },
]

const incompletePolicies: PolicyListItem[] = [
  ...completePolicies,
  {
    uuid: 'policy-3',
    name: 'Company PTO policy',
    policyType: 'vacation',
    isComplete: false,
    enrolledDisplay: '\u2013',
  },
]

export const Default = () => (
  <PolicyListPresentation
    policies={incompletePolicies}
    onCreatePolicy={onCreatePolicy}
    onEditPolicy={onEditPolicy}
    onFinishSetup={onFinishSetup}
    onDeletePolicy={onDeletePolicy}
  />
)

export const EmptyState = () => (
  <PolicyListPresentation
    policies={[]}
    onCreatePolicy={onCreatePolicy}
    onEditPolicy={onEditPolicy}
    onFinishSetup={onFinishSetup}
    onDeletePolicy={onDeletePolicy}
  />
)

export const WithDeleteSuccessAlert = () => (
  <PolicyListPresentation
    policies={completePolicies}
    onCreatePolicy={onCreatePolicy}
    onEditPolicy={onEditPolicy}
    onFinishSetup={onFinishSetup}
    onDeletePolicy={onDeletePolicy}
    deleteSuccessAlert='Policy "Bereavement Policy" deleted successfully'
    onDismissDeleteAlert={onDismissDeleteAlert}
  />
)

export const DeletingPolicy = () => (
  <PolicyListPresentation
    policies={incompletePolicies}
    onCreatePolicy={onCreatePolicy}
    onEditPolicy={onEditPolicy}
    onFinishSetup={onFinishSetup}
    onDeletePolicy={onDeletePolicy}
    isDeletingPolicyId="policy-2"
  />
)
