/** @internal */
export interface PolicyListItem {
  /** Stable identifier for the policy row (time-off policy UUID, or company UUID for the merged holiday entry). */
  uuid: string
  /** Display name of the policy. */
  name: string
  /** Policy type string from the time-off API (e.g. sick, vacation), or `'holiday'` for the merged holiday entry. */
  policyType: string
  /** Whether the policy has finished setup. Incomplete entries show a finish-setup action. */
  isComplete: boolean
  /** Pre-formatted enrolled-employees label (e.g. "All employees", "3 employees", or a dash). */
  enrolledDisplay: string
  /** True for the merged holiday pay policy entry; controls the delete-confirmation copy. */
  isHoliday?: boolean
}

/** @internal */
export interface PolicyListPresentationProps {
  /** The list of policies to render, including the optional merged holiday entry. */
  policies: PolicyListItem[]
  /** Invoked when the user clicks the create-policy action. */
  onCreatePolicy: () => void
  /** Invoked when the user opens an existing policy from the row menu. */
  onEditPolicy: (policy: PolicyListItem) => void
  /** Invoked when the user clicks the finish-setup action on an incomplete policy. */
  onFinishSetup: (policy: PolicyListItem) => void
  /** Invoked when the user confirms deletion; resolves to true on success so the dialog can close. */
  onDeletePolicy: (policy: PolicyListItem) => Promise<boolean>
  /** Optional success message rendered as a dismissible alert after a delete. */
  deleteSuccessAlert?: string | null
  /** Invoked when the user dismisses the delete success alert. */
  onDismissDeleteAlert?: () => void
  /** UUID of the policy currently being deleted; used to show a per-row loading state. */
  isDeletingPolicyId?: string | null
  /** True while any mutation is in flight; drives the dialog confirm button's loading state. */
  isPending?: boolean
}
