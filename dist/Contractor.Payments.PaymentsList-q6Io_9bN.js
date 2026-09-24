const title = "Contractor payments";
const subtitle = "Upcoming and past payments";
const breadcrumbLabel = "Contractor payments";
const createPaymentCta = "New payment";
const startDate = "Start date";
const applyDate = "Apply date";
const paymentDateColumnLabel = "Payment date";
const reimbursementTotalColumnLabel = "Reimbursement total";
const wageTotalColumnLabel = "Wage total";
const actionColumnLabel = "Actions";
const viewPaymentCta = "View payment";
const noPaymentsFound = "No payments found";
const noPaymentsDescription = "No contractor payments have been created yet. Create your first payment to get started.";
const alerts = { "paymentCreatedSuccessfully_one": "Successfully created {{count}} contractor payment.", "paymentCreatedSuccessfully_other": "Successfully created {{count}} contractor payments.", "paymentCancelledSuccessfully": "Contractor payment cancelled successfully", "wireDetailsSubmitted": "Wire details submitted", "rfiPendingResponseTitle": "Payments may be blocked: Provide more information to run payments", "rfiPendingResponseDescription": "We need some more information about your business. Please respond as soon as possible to run payments on time.", "rfiPendingReviewTitle": "Payments may be blocked", "rfiPendingReviewDescription": "We're reviewing information about your business. Payments may be blocked until review is complete.", "rfiRespondCta": "Respond" };
const dateRanges = { "last3Months": "Last 3 months", "last6Months": "Last 6 months", "last12Months": "Last 12 months" };
const historicalPaymentCta = { "title": "Record a historical payment", "description": "Add a contractor payment that was made outside of Gusto to keep your records complete.", "button": "Record a historical payment" };
const Contractor_Payments_PaymentsList = {
  title,
  subtitle,
  breadcrumbLabel,
  createPaymentCta,
  startDate,
  applyDate,
  paymentDateColumnLabel,
  reimbursementTotalColumnLabel,
  wageTotalColumnLabel,
  actionColumnLabel,
  viewPaymentCta,
  noPaymentsFound,
  noPaymentsDescription,
  alerts,
  dateRanges,
  historicalPaymentCta
};
export {
  actionColumnLabel,
  alerts,
  applyDate,
  breadcrumbLabel,
  createPaymentCta,
  dateRanges,
  Contractor_Payments_PaymentsList as default,
  historicalPaymentCta,
  noPaymentsDescription,
  noPaymentsFound,
  paymentDateColumnLabel,
  reimbursementTotalColumnLabel,
  startDate,
  subtitle,
  title,
  viewPaymentCta,
  wageTotalColumnLabel
};
