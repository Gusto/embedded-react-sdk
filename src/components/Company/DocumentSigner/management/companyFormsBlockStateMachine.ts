import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { CompanyFormsBlockContextInterface } from './CompanyFormsComponents'
import {
  CompanyFormsCardContextual,
  CompanyFormsEditScreenContextual,
} from './CompanyFormsComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the document surface.
 *
 * @remarks
 * Uses this block's own `company/management/companyForms/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. The document surface is itself `Flow`-driven and `Flow` re-emits
 * every inner event to its parent, and that surface moves between a document list, a signature
 * form and an assign-signatory screen of its own.
 *
 * `company/forms/sign/back` stays absent for the same reason: it returns the signature form to
 * the list, inside the surface.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.CompanyForms',
    event: componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_CANCELLED,
  },
}

const returnToCardWithPendingAlert = reduce(
  (ctx: CompanyFormsBlockContextInterface): CompanyFormsBlockContextInterface => ({
    ...ctx,
    component: CompanyFormsCardContextual as ComponentType,
    header: null,
    successAlert: ctx.pendingAlert ?? null,
    pendingAlert: null,
  }),
)

const recordPendingAlert = (alert: CompanyFormsBlockContextInterface['pendingAlert']) =>
  reduce((ctx: CompanyFormsBlockContextInterface): CompanyFormsBlockContextInterface => ({
    ...ctx,
    pendingAlert: alert,
  }))

/**
 * Card to the document surface and back.
 *
 * @remarks
 * A signature is a *self*-transition: a company signs its forms one at a time, so returning to
 * the card on each one would eject the user before the rest are signed. The signature records
 * that something changed and "Documents signed" surfaces when they actually leave via the back
 * header — the sole exit, since the management document list carries no Continue.
 *
 * `company/signatory/assignSignatory/done` stays absent even though the surface contains an
 * assign-signatory screen that raises it: changing the signatory mid-review should return the
 * user to the document list, which the inner machine already does, not to the card.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const companyFormsBlockStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_REQUESTED,
      'companyForms',
      reduce((ctx: CompanyFormsBlockContextInterface): CompanyFormsBlockContextInterface => ({
        ...ctx,
        component: CompanyFormsEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
        pendingAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_ALERT_DISMISSED,
      'card',
      reduce((ctx: CompanyFormsBlockContextInterface): CompanyFormsBlockContextInterface => ({
        ...ctx,
        component: CompanyFormsCardContextual as ComponentType,
        successAlert: null,
      })),
    ),
  ),
  companyForms: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_UPDATED,
      'companyForms',
      recordPendingAlert('formsSigned'),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_CANCELLED,
      'card',
      returnToCardWithPendingAlert,
    ),
  ),
}
