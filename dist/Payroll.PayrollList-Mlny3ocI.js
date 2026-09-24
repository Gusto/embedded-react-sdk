const dateFilter = { "apply": "Aplicar", "endDate": "Para", "reset": "Restablecer", "selectDates": "Seleccionar fechas", "startDate": "De", "trigger": "Filtrar por fecha" };
const deletePayrollCta = "Cancelar nómina";
const deletePayrollDialog = { "body": "Esto eliminará permanentemente esta nómina fuera de ciclo. Cualquier cambio que haya realizado se perderá.", "cancelCta": "No, regresar", "confirmCta": "Sí, cancelar nómina", "title": "¿Cancelar la nómina de {{payPeriod}}?" };
const deleteSuccessAlert = "Nómina cancelada";
const emptyState = { "default": { "title": "Todas las nóminas han sido procesadas" }, "filtered": { "description": "Intenta ajustar el filtro de fecha para ver más nóminas.", "title": "No hay nóminas en este rango de fechas" } };
const offCycleCta = { "description": "Puedes pagar a un empleado fuera de tu calendario de nómina normal ejecutando una nómina fuera de ciclo.", "title": "Ejecutar una nómina fuera de ciclo" };
const payrollMenuLabel = "Acciones de nómina";
const payrollsListLabel = "Nóminas";
const runPayrollTitle = "Procesar nómina";
const skipPayrollCta = "Omitir nómina";
const skipPayrollDialog = { "body": "Antes de omitir esta nómina, revise las leyes de frecuencia de pago de su estado. Si no le paga al equipo a tiempo, esto podría generar sanciones o multas.", "cancelCta": "No, regresar", "confirmCta": "Sí, omitir nómina", "title": "¿Omitir la nómina de {{payPeriod}}?" };
const skipSuccessAlert = "Nómina omitida";
const submitPayrollCta = "Revisar y enviar";
const tableHeaders = { "2": "Fecha de pago", "3": "Ejecutado por" };
const title = "Próxima nómina";
const type = { "External": "Externo", "Off-Cycle": "Fuera de ciclo" };
const Payroll_PayrollList = {
  dateFilter,
  deletePayrollCta,
  deletePayrollDialog,
  deleteSuccessAlert,
  emptyState,
  offCycleCta,
  payrollMenuLabel,
  payrollsListLabel,
  runPayrollTitle,
  skipPayrollCta,
  skipPayrollDialog,
  skipSuccessAlert,
  submitPayrollCta,
  tableHeaders,
  title,
  type
};
export {
  dateFilter,
  Payroll_PayrollList as default,
  deletePayrollCta,
  deletePayrollDialog,
  deleteSuccessAlert,
  emptyState,
  offCycleCta,
  payrollMenuLabel,
  payrollsListLabel,
  runPayrollTitle,
  skipPayrollCta,
  skipPayrollDialog,
  skipSuccessAlert,
  submitPayrollCta,
  tableHeaders,
  title,
  type
};
