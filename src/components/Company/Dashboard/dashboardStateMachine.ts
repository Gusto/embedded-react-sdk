import { transition, reduce, state } from 'robot3'
import type { DashboardTab } from './Dashboard'
import {
  DashboardViewContextual,
  IndustryContextual,
  LocationsContextual,
  FederalTaxesContextual,
  BankAccountContextual,
  PayScheduleContextual,
  StateTaxesContextual,
  TaxPaymentsContextual,
  AssignSignatoryContextual,
  CompanyFormsContextual,
  type DashboardContextInterface,
} from './DashboardComponents'
import { componentEvents } from '@/shared/constants'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.COMPANY_DASHBOARD_TAB_CHANGE]: { tab: DashboardTab }
  [componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED]: { signatoryId?: string }
}

/**
 * Back affordance rendered above every spoke.
 *
 * @remarks
 * Uses a dedicated `COMPANY_DASHBOARD_BACK` event rather than the generic
 * `componentEvents.CANCEL`. The spokes are themselves `Flow`-driven components,
 * and `Flow` re-emits every event to its parent — so a `CANCEL` transition here
 * would fire whenever a user cancelled an *inner* screen (a location form, say),
 * ejecting them from the whole spoke instead of returning them to that spoke's
 * own list. Several spokes also have no cancel affordance of their own at all
 * (`Industry`, `FederalTaxes` and `AssignSignatory` are submit-only; `Locations`
 * opens straight into a form when the company has no addresses), so this header
 * is the only reliable way back to the dashboard.
 *
 * @internal
 */
const spokeHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'backToDashboardCta',
    namespace: 'Company.Dashboard',
    event: componentEvents.COMPANY_DASHBOARD_BACK,
  },
}

const toSpoke = (component: DashboardContextInterface['component']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component,
    header: spokeHeader,
    successAlert: null,
    pendingAlert: null,
  }))

const returnToIndex = reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
  ...ctx,
  component: DashboardViewContextual,
  header: null,
  successAlert: null,
  pendingAlert: null,
}))

const returnToIndexWithAlert = (alert: DashboardContextInterface['successAlert']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
    successAlert: alert,
    pendingAlert: null,
  }))

/**
 * Leaves a spoke, promoting any alert it recorded mid-flow into the dashboard's
 * success alert. Used by spokes whose saves must not themselves return to the
 * dashboard — see {@link DashboardContextInterface.pendingAlert}.
 *
 * @internal
 */
const returnToIndexWithPendingAlert = reduce(
  (ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    component: DashboardViewContextual,
    header: null,
    successAlert: ctx.pendingAlert ?? null,
    pendingAlert: null,
  }),
)

/**
 * Opens the signatory spoke, carrying the identifier the Signatory card reported
 * alongside the usual spoke setup — see {@link DashboardContextInterface.signatoryId}
 * for why `AssignSignatory` cannot be handed the company alone.
 *
 * @internal
 */
const toSignatorySpoke = reduce(
  (
    ctx: DashboardContextInterface,
    ev: MachineEventType<
      EventPayloads,
      typeof componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED
    >,
  ): DashboardContextInterface => ({
    ...ctx,
    component: AssignSignatoryContextual,
    header: spokeHeader,
    successAlert: null,
    pendingAlert: null,
    signatoryId: ev.payload.signatoryId,
  }),
)

const recordPendingAlert = (alert: DashboardContextInterface['pendingAlert']) =>
  reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
    ...ctx,
    pendingAlert: alert,
  }))

/**
 * Hub-and-spoke machine backing `CompanyManagement.DashboardFlow`.
 *
 * @remarks
 * Deliberately has no final state: the dashboard is a management surface a host
 * can keep mounted indefinitely, so there is no terminal step to model one
 * around. No state transitions on `componentEvents.CANCEL` — see
 * {@link spokeHeader} for why.
 *
 * @internal
 */
export const dashboardStateMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
      'industry',
      toSpoke(IndustryContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED,
      'locations',
      toSpoke(LocationsContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED,
      'federalTaxes',
      toSpoke(FederalTaxesContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_REQUESTED,
      'bankAccount',
      toSpoke(BankAccountContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_REQUESTED,
      'paySchedule',
      toSpoke(PayScheduleContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      'stateTaxes',
      toSpoke(StateTaxesContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_TAX_PAYMENTS_EDIT_REQUESTED,
      'taxPayments',
      toSpoke(TaxPaymentsContextual),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED,
      'signatory',
      toSignatorySpoke,
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_EDIT_REQUESTED,
      'companyForms',
      toSpoke(CompanyFormsContextual),
    ),
    transition(
      componentEvents.COMPANY_DASHBOARD_ALERT_DISMISSED,
      'index',
      reduce((ctx: DashboardContextInterface): DashboardContextInterface => ({
        ...ctx,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_DASHBOARD_TAB_CHANGE,
      'index',
      reduce(
        (
          ctx: DashboardContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.COMPANY_DASHBOARD_TAB_CHANGE>,
        ): DashboardContextInterface => ({
          ...ctx,
          selectedTab: ev.payload.tab,
        }),
      ),
    ),
  ),
  industry: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_INDUSTRY_SELECTED,
      'index',
      returnToIndexWithAlert('industryUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  locations: state<MachineTransition>(
    // A company usually adds several addresses in one visit, so a save must not
    // eject the user from the sub-flow. These self-transitions keep the spoke
    // open and only record that something changed; the alert surfaces when the
    // user actually leaves, via either exit below.
    transition(
      componentEvents.COMPANY_LOCATION_CREATED,
      'locations',
      recordPendingAlert('locationsUpdated'),
    ),
    transition(
      componentEvents.COMPANY_LOCATION_UPDATED,
      'locations',
      recordPendingAlert('locationsUpdated'),
    ),
    transition(componentEvents.COMPANY_LOCATION_DONE, 'index', returnToIndexWithPendingAlert),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndexWithPendingAlert),
  ),
  bankAccount: state<MachineTransition>(
    // Adding an account and verifying its micro-deposits are separate steps of one
    // visit, so a save must not eject the user from the sub-flow. These
    // self-transitions keep the spoke open and only record that something changed;
    // the alert surfaces when the user actually leaves, via either exit below.
    // Announcing on COMPANY_BANK_ACCOUNT_DONE instead would claim the account was
    // updated even when the user opened the spoke and continued without touching
    // anything, and would stay silent when they left via the back header after a
    // real change. The component's own COMPANY_BANK_ACCOUNT_CANCEL stays absent: it
    // fires on screens inside the sub-flow and must not eject the user either.
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_CREATED,
      'bankAccount',
      recordPendingAlert('bankAccountUpdated'),
    ),
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_VERIFIED,
      'bankAccount',
      recordPendingAlert('bankAccountUpdated'),
    ),
    transition(componentEvents.COMPANY_BANK_ACCOUNT_DONE, 'index', returnToIndexWithPendingAlert),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndexWithPendingAlert),
  ),
  paySchedule: state<MachineTransition>(
    // PaySchedule is a hub in its own right: its edit form, assignment wizard and
    // AutoPilot dialog all return to its own overview, so it has no completion
    // event to exit on, and its editSchedule state transitions on the generic
    // CANCEL. The back header is the only way out, and the spoke surfaces its own
    // success alerts internally — hence no dashboard-level alert here.
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  federalTaxes: state<MachineTransition>(
    // COMPANY_FEDERAL_TAXES_UPDATED also fires on save, immediately before
    // COMPANY_FEDERAL_TAXES_DONE; transitioning on the latter alone keeps the
    // alert tied to a single, unambiguous completion signal.
    transition(
      componentEvents.COMPANY_FEDERAL_TAXES_DONE,
      'index',
      returnToIndexWithAlert('federalTaxesUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  stateTaxes: state<MachineTransition>(
    // StateTaxes is a hub in its own right: its state list, each state's
    // requirements form and each state's tax rate history all return to the
    // list, so COMPANY_STATE_TAX_EDIT and _MANAGE_RATES are intentionally absent.
    // It has no completion event either — the management list carries no
    // Continue — so the back header is the only way out. A company often updates
    // several states, or schedules several rates, in one visit, so saves only
    // record the alert and it surfaces once the user leaves.
    transition(
      componentEvents.COMPANY_STATE_TAX_UPDATED,
      'stateTaxes',
      recordPendingAlert('stateTaxesUpdated'),
    ),
    transition(
      componentEvents.COMPANY_STATE_TAX_RATE_SCHEDULED,
      'stateTaxes',
      recordPendingAlert('stateTaxesUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndexWithPendingAlert),
  ),
  taxPayments: state<MachineTransition>(
    // TaxPaymentsFlow is a hub in its own right and, being read-only, has neither
    // a completion event nor anything to report a success alert about:
    // TAX_PAYMENT_VIEW and TAX_PAYMENT_BACK move between its list and a payment's
    // detail, both of which live inside the spoke. The back header is the only way
    // out.
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  signatory: state<MachineTransition>(
    // COMPANY_SIGNATORY_CREATED / _UPDATED / _INVITED and
    // COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED are intentionally absent: the first
    // three fire on save, immediately before COMPANY_ASSIGN_SIGNATORY_DONE, and
    // the last fires as the user switches between the create and invite forms
    // inside the spoke. Transitioning on the single completion event keeps the
    // alert tied to one unambiguous signal, whichever way the signatory was
    // assigned.
    transition(
      componentEvents.COMPANY_ASSIGN_SIGNATORY_DONE,
      'index',
      returnToIndexWithAlert('signatoryUpdated'),
    ),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndex),
  ),
  companyForms: state<MachineTransition>(
    // DocumentSigner is a hub in its own right, and one that contains an
    // assign-signatory screen of its own: COMPANY_VIEW_FORM_TO_SIGN,
    // COMPANY_SIGN_FORM_DONE, COMPANY_SIGN_FORM_BACK, COMPANY_FORM_EDIT_SIGNATORY
    // and — note — COMPANY_ASSIGN_SIGNATORY_DONE all move between its own
    // screens. That last one is the subtle hazard: it is the very event the
    // `signatory` spoke above returns to the dashboard on, so declaring it here
    // too would eject a user who merely changed the signatory from inside the
    // document list.
    //
    // A company signs its forms one at a time, so a signature must not end the
    // visit either. The self-transition records that something was signed and
    // the alert surfaces when the user actually leaves, via either exit below.
    transition(
      componentEvents.COMPANY_SIGN_FORM,
      'companyForms',
      recordPendingAlert('formsSigned'),
    ),
    transition(componentEvents.COMPANY_FORMS_DONE, 'index', returnToIndexWithPendingAlert),
    transition(componentEvents.COMPANY_DASHBOARD_BACK, 'index', returnToIndexWithPendingAlert),
  ),
}
