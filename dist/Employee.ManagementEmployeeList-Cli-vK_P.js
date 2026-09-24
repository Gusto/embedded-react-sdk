const backToListCta = "Volver a empleados";
const cancelCta = "Cancelar incorporación";
const deleteDialog = { "confirmCta": "Eliminar empleado", "description": "Esto eliminará permanentemente a este empleado de tu cuenta. Esta acción no se puede deshacer.", "title": "¿Cancelar la incorporación del empleado?" };
const dismissCta = "Despedir empleado";
const employeeListLabel = "Lista de empleados";
const emptyState = { "active": { "description": "Los empleados que hayan completado la incorporación aparecerán aquí", "title": "No hay empleados activos" }, "dismissed": { "description": "Los empleados dados de baja aparecerán aquí", "title": "No hay empleados despedidos" }, "onboarding": { "description": "Los empleados que se estén incorporando actualmente aparecerán aquí", "title": "No hay empleados en incorporación" } };
const hamburgerTitle = "Menú de acciones del empleado";
const lastDayLabel = "Último día";
const tabs = { "active": "Activo", "dismissed": "Descartado", "onboarding": "Incorporación" };
const tabsLabel = "Pestañas de estado del empleado";
const Employee_ManagementEmployeeList = {
  backToListCta,
  cancelCta,
  deleteDialog,
  dismissCta,
  employeeListLabel,
  emptyState,
  hamburgerTitle,
  lastDayLabel,
  tabs,
  tabsLabel
};
export {
  backToListCta,
  cancelCta,
  Employee_ManagementEmployeeList as default,
  deleteDialog,
  dismissCta,
  employeeListLabel,
  emptyState,
  hamburgerTitle,
  lastDayLabel,
  tabs,
  tabsLabel
};
