import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { BankAccountBlockContextInterface } from './BankAccountComponents'
import { BankAccountCardContextual, BankAccountEditScreenContextual } from './BankAccountComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the bank account sub-flow.
 *
 * @remarks
 * Uses this block's own `company/management/bankAccount/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. That distinction is load-bearing here rather than theoretical: the
 * sub-flow's own machine transitions on bare `CANCEL` to return the micro-deposit form to the
 * account view, and `Flow` re-emits that upward. A `CANCEL` transition here would therefore
 * close the whole block whenever a user backed out of verification.
 *
 * `company/bankAccount/cancel` stays absent for the same reason: it returns the add form to
 * the view, inside the sub-flow.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.BankAccount',
    event: componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED,
  },
}

const returnToCardWithPendingAlert = reduce(
  (ctx: BankAccountBlockContextInterface): BankAccountBlockContextInterface => ({
    ...ctx,
    component: BankAccountCardContextual as ComponentType,
    header: null,
    successAlert: ctx.pendingAlert ?? null,
    pendingAlert: null,
  }),
)

const recordPendingAlert = (alert: BankAccountBlockContextInterface['pendingAlert']) =>
  reduce((ctx: BankAccountBlockContextInterface): BankAccountBlockContextInterface => ({
    ...ctx,
    pendingAlert: alert,
  }))

/**
 * Card to the bank account sub-flow and back.
 *
 * @remarks
 * A save is a *self*-transition, as in the locations block. Adding an account and verifying
 * its micro-deposits are separate steps of one visit, so returning to the card on the first
 * would strand the user before the second. The save records that something changed and the
 * alert surfaces when they actually leave via the back header — the sole exit, since the
 * management view carries no Continue.
 *
 * Announcing on the sub-flow's own completion instead would claim the account was updated even
 * when the user opened it and continued without touching anything, and would stay silent when
 * they left via the back header after a real change.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const bankAccountBlockStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_REQUESTED,
      'bankAccount',
      reduce((ctx: BankAccountBlockContextInterface): BankAccountBlockContextInterface => ({
        ...ctx,
        component: BankAccountEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
        pendingAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_ALERT_DISMISSED,
      'card',
      reduce((ctx: BankAccountBlockContextInterface): BankAccountBlockContextInterface => ({
        ...ctx,
        component: BankAccountCardContextual as ComponentType,
        successAlert: null,
      })),
    ),
  ),
  bankAccount: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_UPDATED,
      'bankAccount',
      recordPendingAlert('bankAccountUpdated'),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED,
      'card',
      returnToCardWithPendingAlert,
    ),
  ),
}
