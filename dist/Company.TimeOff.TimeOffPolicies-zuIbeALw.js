const actions = { "deletePolicy": "Eliminar póliza", "menuFor": "Acciones para {{name}}", "menuTrigger": "Acciones para {{name}}", "viewPolicy": "Ver póliza" };
const allEmployeesLabel = "Todos los empleados";
const createPolicyCta = "Crear política";
const deleteHolidayDialog = { "description": "Esto eliminará la política de pago de días festivos de la empresa.", "title": "¿Estás seguro de que quieres eliminar la política de pago de días festivos de la empresa?" };
const deletePolicyDialog = { "confirmCta": "Eliminar política", "description": 'Esto eliminará la política "{{name}}" y todas las solicitudes de tiempo libre asociadas.', "title": '¿Estás seguro de que quieres eliminar la política "{{name}}"?' };
const employeeCount_one = "{{count}} empleado";
const employeeCount_other = "{{count}} empleados";
const emptyState = { "body": "Administra el tiempo libre de los empleados creando una política.", "heading": "No tienes ninguna política de tiempo libre" };
const enrolledDash = "–";
const errors = { "deleteFailed": "No se puede eliminar esta póliza. Inténtalo de nuevo.", "pendingRequestsBlockDeletion": '"{{name}}" tiene solicitudes de tiempo libre pendientes o aprobadas. Rechaza o cancela esas solicitudes antes de eliminar esta política.' };
const finishSetupCta = "Finalizar configuración";
const flash = { "holidayDeleted": "La política de pago de días festivos se eliminó correctamente", "policyDeleted": 'La póliza "{{name}}" se eliminó correctamente' };
const holidayPayPolicy = "Política de pago por días festivos";
const incompleteBadge = "Incompleta";
const pageTitle = "Políticas de tiempo libre";
const tableHeaders = { "enrolled": "Inscrito" };
const tableLabel = "Políticas de tiempo libre";
const Company_TimeOff_TimeOffPolicies = {
  actions,
  allEmployeesLabel,
  createPolicyCta,
  deleteHolidayDialog,
  deletePolicyDialog,
  employeeCount_one,
  employeeCount_other,
  emptyState,
  enrolledDash,
  errors,
  finishSetupCta,
  flash,
  holidayPayPolicy,
  incompleteBadge,
  pageTitle,
  tableHeaders,
  tableLabel
};
export {
  actions,
  allEmployeesLabel,
  createPolicyCta,
  Company_TimeOff_TimeOffPolicies as default,
  deleteHolidayDialog,
  deletePolicyDialog,
  employeeCount_one,
  employeeCount_other,
  emptyState,
  enrolledDash,
  errors,
  finishSetupCta,
  flash,
  holidayPayPolicy,
  incompleteBadge,
  pageTitle,
  tableHeaders,
  tableLabel
};
