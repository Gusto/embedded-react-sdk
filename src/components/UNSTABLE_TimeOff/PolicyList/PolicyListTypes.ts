export interface PolicyListItem {
  uuid: string
  name: string
  policyType: string
  isComplete: boolean
  enrolledDisplay: string
}

export interface PolicyListPresentationProps {
  policies: PolicyListItem[]
  onCreatePolicy: () => void
  onEditPolicy: (policy: PolicyListItem) => void
  onFinishSetup: (policy: PolicyListItem) => void
  onDeletePolicy: (policy: PolicyListItem) => void
  deleteSuccessAlert?: string | null
  onDismissDeleteAlert?: () => void
  isDeletingPolicyId?: string | null
}
