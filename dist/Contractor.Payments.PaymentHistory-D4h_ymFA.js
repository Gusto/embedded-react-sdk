const actions = { "cancel": "Cancelar pago" };
const breadcrumbLabel = "Historial de pagos";
const errors = { "paymentGroupNotFound": "Grupo de pago de contratista no encontrado" };
const na = "N/D";
const noPaymentsDescription = "No hay pagos para esta fecha.";
const noPaymentsFound = "No se encontraron pagos";
const perHour = "/hr";
const subtitle = "Pagos debitados el <strong>{{date}}</strong>";
const tableHeaders = { "contractor": "Contratista", "reimbursements": "Reembolsos", "total": "Total", "wage": "Monto fijo", "wageType": "Salario" };
const title = "Historial de pagos del contratista";
const Contractor_Payments_PaymentHistory = {
  actions,
  breadcrumbLabel,
  errors,
  na,
  noPaymentsDescription,
  noPaymentsFound,
  perHour,
  subtitle,
  tableHeaders,
  title
};
export {
  actions,
  breadcrumbLabel,
  Contractor_Payments_PaymentHistory as default,
  errors,
  na,
  noPaymentsDescription,
  noPaymentsFound,
  perHour,
  subtitle,
  tableHeaders,
  title
};
