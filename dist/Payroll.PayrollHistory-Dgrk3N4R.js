const cancelDialog = { "body": "Todos los cambios que hayas realizado en esta nómina se guardarán.", "deadline": "Ejecuta esta nómina para {{deadline}} a fin de asegurarte de que tus empleados reciban su pago a tiempo.", "primaryAction": "Sí, cancelar la nómina", "secondaryAction": "No, regresar", "title": "¿Cancelar la nómina de {{payPeriod}}?" };
const columns = { "payDate": "Fecha de pago", "totalPayroll": "Nómina total" };
const dataView = { "label": "Historial de nómina" };
const dateFilter = { "apply": "Aplicar", "endDate": "Hasta", "reset": "Restablecer", "selectDates": "Seleccionar fechas", "startDate": "De", "trigger": "Filtrar por fecha" };
const emptyState = { "default": { "description": "Cuando proceses nóminas, aparecerán aquí para que las consultes fácilmente.", "title": "No hay historial de nómina" }, "filtered": { "description": "Prueba ajustar el filtro de fechas para ver más nóminas.", "title": "No hay nóminas en este rango de fechas" } };
const labels = { "noAmount": "—" };
const menu = { "cancelPayroll": "Cancelar nómina", "viewReceipt": "Ver recibo de nómina", "viewSummary": "Ver resumen de nómina" };
const title = "Historial de nómina";
const Payroll_PayrollHistory = {
  cancelDialog,
  columns,
  dataView,
  dateFilter,
  emptyState,
  labels,
  menu,
  title
};
export {
  cancelDialog,
  columns,
  dataView,
  dateFilter,
  Payroll_PayrollHistory as default,
  emptyState,
  labels,
  menu,
  title
};
