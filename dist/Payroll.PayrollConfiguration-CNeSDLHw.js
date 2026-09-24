const alerts = { "alreadyProcessed": "Esta nómina ya se procesó. Si desea hacer cambios, cancélela y procésela de nuevo.", "directDepositDeadline": "Para pagar a tus empleados con depósito directo para el {{payDate}}, deberás procesar la nómina antes de las {{time}} del {{date}}.", "directDepositDeadlineText": "Asegúrate de enviar todo antes de la fecha límite para garantizar pagos puntuales.", "employeeUpdated": { "label": "{{employeeName}} se actualizó correctamente" }, "payrollDeadline": { "label": "Fecha límite de la nómina", "message": "Para pagarles a tus empleados con depósito directo en la fecha de pago, deberás ejecutar la nómina antes de la fecha límite." }, "payrollLate": "Tu fecha de pago original era el {{initialCheckDate}}", "payrollLateText": "Ejecuta la nómina antes de {{time}} el {{date}} para pagarles a tus empleados el {{newCheckDate}}.", "progressSaved": "Tu progreso se ha guardado", "skippedEmployees": { "employeeAddressNotVerified": "Dirección del empleado no verificada", "label": "Empleados omitidos" } };
const breadcrumbLabel = "Editar nómina para {{startDate}} - {{endDate}}";
const breadcrumbLabelDismissal = "Editar nómina de despido";
const calculatePayroll = "Calcular y revisar";
const calculatePayrollTitle = "Calcular y revisar";
const calculatingDescription = "Esto puede tardar uno o dos minutos. Puedes navegar a otra página mientras sucede.";
const calculatingPayroll = "Calculando nómina...";
const calculatingTitle = "Calculando la nómina...";
const description = "Nómina de {{payrollType}} para <dateWrapper>{{startDate}} - {{endDate}}</dateWrapper>";
const descriptionDismissal = "Nómina de {{payrollType}}";
const editMenu = { "setNetEarnings": "Establecer las ganancias netas del empleado", "skip": "Omitir empleado", "unskip": "Dejar de omitir empleado" };
const employeeCompensationsTitle = "Compensaciones de empleados";
const hoursAndEarningsDescription = "Revisa y actualiza las horas, reembolsos y ganancias adicionales de tu empleado a continuación.";
const loadingDescription = "Esto puede tardar uno o dos minutos. Puedes navegar a otra página mientras sucede.";
const loadingTitle = "Preparando la nómina...";
const pageTitle = "Editar nómina";
const skippedBadge = "Omitido";
const tableColumns = { "additionalEarnings": "Ingresos adicionales", "reimbursements": "Reembolsos", "timeOff": "Tiempo libre", "totalPay": "Pago total" };
const unknownEmployeeFallback = "Empleado desconocido";
const Payroll_PayrollConfiguration = {
  alerts,
  breadcrumbLabel,
  breadcrumbLabelDismissal,
  calculatePayroll,
  calculatePayrollTitle,
  calculatingDescription,
  calculatingPayroll,
  calculatingTitle,
  description,
  descriptionDismissal,
  editMenu,
  employeeCompensationsTitle,
  hoursAndEarningsDescription,
  loadingDescription,
  loadingTitle,
  pageTitle,
  skippedBadge,
  tableColumns,
  unknownEmployeeFallback
};
export {
  alerts,
  breadcrumbLabel,
  breadcrumbLabelDismissal,
  calculatePayroll,
  calculatePayrollTitle,
  calculatingDescription,
  calculatingPayroll,
  calculatingTitle,
  Payroll_PayrollConfiguration as default,
  description,
  descriptionDismissal,
  editMenu,
  employeeCompensationsTitle,
  hoursAndEarningsDescription,
  loadingDescription,
  loadingTitle,
  pageTitle,
  skippedBadge,
  tableColumns,
  unknownEmployeeFallback
};
