const breadcrumbLabel = "Período de pago";
const emptyState = "No hay períodos de pago por terminación sin procesar disponibles.";
const errors = { "invalidPayPeriod": "El periodo de pago seleccionado ya no está disponible", "missingPayrollId": "Se creó la nómina de despido, pero no se devolvió ningún ID de nómina", "noPayPeriodSelected": "Selecciona un período de pago antes de continuar" };
const pageDescription = "Selecciona el período de pago para la nómina final del empleado dado de baja.";
const selectPlaceholder = "Selecciona un período de pago";
const Payroll_Dismissal = {
  breadcrumbLabel,
  emptyState,
  errors,
  pageDescription,
  selectPlaceholder
};
export {
  breadcrumbLabel,
  Payroll_Dismissal as default,
  emptyState,
  errors,
  pageDescription,
  selectPlaceholder
};
