const accrualMethod = { "label": "Tipo de acumulación", "perAnniversaryYear": "Fija", "perCalendarYear": "Fija", "perHourPaid": "Según las horas trabajadas", "perHourPaidNoOvertime": "Según las horas trabajadas", "perHourWorked": "Según las horas trabajadas", "perHourWorkedNoOvertime": "Según las horas trabajadas", "perPayPeriod": "Fijo", "unlimited": "Ilimitado" };
const accrualRate = { "label": "Tasa de acumulación", "perAnniversaryYear": "{{accrualRate}} hora(s) por año de aniversario", "perCalendarYear": "{{accrualRate}} hora(s) por año calendario", "perHourPaid": "{{accrualRate}} hora(s) por cada {{accrualRateUnit}} hora(s), incluyendo horas extra y todas las horas pagadas", "perHourPaidNoOvertime": "{{accrualRate}} hora(s) por cada {{accrualRateUnit}} hora(s) trabajada y todas las horas pagadas, excluyendo horas extra", "perHourWorked": "{{accrualRate}} hora(s) por cada {{accrualRateUnit}} hora(s) trabajada, incluyendo horas extra", "perHourWorkedNoOvertime": "{{accrualRate}} hora(s) por cada {{accrualRateUnit}} hora(s) trabajada, excluyendo horas extra", "perPayPeriod": "{{accrualRate}} hora(s) por período de pago", "unlimited": "-" };
const accrualRateTitle = "Tasa de acumulación";
const accrualWaitingPeriodDays = { "label": "Período de espera", "noPeriod": "Sin período de espera", "withPeriod": "{{count}} día(s)" };
const addEmployeeModal = { "description": "Selecciona a los empleados que deseas agregar a esta póliza. Los empleados que no aparecen ya están incluidos o no son elegibles.", "title": "Agregar empleado a esta póliza" };
const breadcrumb = "Políticas de tiempo libre";
const carryoverLimitHours = { "label": "Límite de traspaso", "noLimit": "Sin límite de traspaso", "withLimit": "{{count}} hora(s)" };
const changeSettingsCta = "Cambiar";
const editBalanceModal = { "balanceLabel": "Saldo (horas)", "currentBalance": "Saldo actual", "errors": { "balanceExceedsMax": "El saldo no puede exceder el máximo de la política de {{max}} horas. Reduzca el saldo o aumente el máximo de saldo de la política.", "updateFailed": "No se puede actualizar el saldo. Intenta de nuevo." }, "hoursUnit": "horas", "title": "Editar saldo de tiempo libre de {{name}}", "updateCta": "Actualizar saldo" };
const editPolicyCta = "Editar política";
const employeeTable = { "actions": "Acciones", "balance": "Saldo (horas)", "editBalance": "Editar saldo" };
const flash = { "balanceUpdated": "Se ha actualizado el saldo de tiempo libre de {{name}}.", "employeeRemoved": "Se ha quitado a {{name}} de la política.", "employeesAdded_one": "Se ha agregado {{count}} empleado a esta política.", "employeesAdded_other": "Se han agregado {{count}} empleados a esta política." };
const maxAccrualHoursPerYear = { "label": "Máximo de acumulación", "noMaximum": "Sin máximo", "withMaximum": "{{count}} hora(s) por año" };
const maxHours = { "label": "Saldo máximo", "noMaximum": "Sin máximo", "withMaximum": "{{count}} hora(s)" };
const paidOutOnTermination = { "label": "Pago al finalizar la relación laboral", "no": "No, los saldos de tiempo libre restantes de esta política no se pagan cuando se despide a un empleado.", "yes": "Sí, los saldos de tiempo libre restantes de esta política se pagan cuando se despide a un empleado." };
const policyName = "Nombre de la política";
const policySettingsTitle = "Configuración de la política";
const policyType = { "bereavement": "Duelo", "custom": "Política personalizada", "floatingHoliday": "Día festivo flotante", "juryDuty": "Deber de jurado", "label": "Tipo de política", "learningAndDevelopment": "Aprendizaje y desarrollo", "parentalLeave": "Licencia parental", "personalDay": "Día personal", "sick": "Licencia por enfermedad", "vacation": "Tiempo libre pagado", "volunteer": "Política de voluntariado", "weather": "Política por clima" };
const removeEmployeeModal = { "alert": "Cuando quitas a un empleado de una póliza, se elimina cualquier saldo existente.", "title": "¿Quitar a {{name}} de la póliza?" };
const removeEmployeesModal = { "alert": "Cuando quitas a un empleado de una póliza, se elimina cualquier saldo existente.", "removeCta": "Quitar empleados", "title": "¿Quitar a {{count}} empleado(s) de la póliza?" };
const resetDate = "Fecha de restablecimiento";
const subtitle = { "sick": "Política de licencia por enfermedad", "vacation": "Política de tiempo libre pagado" };
const tabs = { "policyDetails": "Detalles de la póliza" };
const Company_TimeOff_TimeOffPolicyDetails = {
  accrualMethod,
  accrualRate,
  accrualRateTitle,
  accrualWaitingPeriodDays,
  addEmployeeModal,
  breadcrumb,
  carryoverLimitHours,
  changeSettingsCta,
  editBalanceModal,
  editPolicyCta,
  employeeTable,
  flash,
  maxAccrualHoursPerYear,
  maxHours,
  paidOutOnTermination,
  policyName,
  policySettingsTitle,
  policyType,
  removeEmployeeModal,
  removeEmployeesModal,
  resetDate,
  subtitle,
  tabs
};
export {
  accrualMethod,
  accrualRate,
  accrualRateTitle,
  accrualWaitingPeriodDays,
  addEmployeeModal,
  breadcrumb,
  carryoverLimitHours,
  changeSettingsCta,
  Company_TimeOff_TimeOffPolicyDetails as default,
  editBalanceModal,
  editPolicyCta,
  employeeTable,
  flash,
  maxAccrualHoursPerYear,
  maxHours,
  paidOutOnTermination,
  policyName,
  policySettingsTitle,
  policyType,
  removeEmployeeModal,
  removeEmployeesModal,
  resetDate,
  subtitle,
  tabs
};
