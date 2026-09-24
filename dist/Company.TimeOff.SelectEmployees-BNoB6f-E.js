const departmentColumn = "Departamento";
const description = "Selecciona los empleados que quieres agregar a esta política.";
const emptyState = "Todos los empleados elegibles ya se han agregado a esta política.";
const errors = { "completePolicyFailed": "No se puede completar esta política. {{details}}" };
const holidayDescription = "Selecciona a los empleados que quieres agregar a esta política de pago por días festivos.";
const reassignmentWarning = "Cualquier empleado actualmente asignado a otra política de tiempo libre pagado será movido a esta política.";
const startingBalanceColumn = "Saldo inicial (hrs)";
const title = "Agregar empleados a la póliza";
const Company_TimeOff_SelectEmployees = {
  departmentColumn,
  description,
  emptyState,
  errors,
  holidayDescription,
  reassignmentWarning,
  startingBalanceColumn,
  title
};
export {
  Company_TimeOff_SelectEmployees as default,
  departmentColumn,
  description,
  emptyState,
  errors,
  holidayDescription,
  reassignmentWarning,
  startingBalanceColumn,
  title
};
