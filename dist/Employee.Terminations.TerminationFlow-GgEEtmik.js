const breadcrumbs = { "form": "Despedir empleado" };
const cancelSuccess = "La terminación se canceló correctamente";
const offCycleCreation = { "error": "No se pudo crear la nómina fuera de ciclo. Inténtalo de nuevo.", "loading": "Creando una nómina fuera de ciclo…", "noPeriodsError": "No se encontraron períodos de pago de terminación sin procesar para este empleado.", "retry": "Reintentar" };
const Employee_Terminations_TerminationFlow = {
  breadcrumbs,
  cancelSuccess,
  offCycleCreation
};
export {
  breadcrumbs,
  cancelSuccess,
  Employee_Terminations_TerminationFlow as default,
  offCycleCreation
};
