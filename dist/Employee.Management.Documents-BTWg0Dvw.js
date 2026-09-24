const columns = { "actions": "Acciones", "requiresSigning": "Estado de firma", "title": "Formulario" };
const emptyState = { "description": "Los formularios del empleado aparecerán aquí cuando estén disponibles", "title": "No hay formularios" };
const listLabel = "Lista de formularios del empleado";
const signingStatus = { "notSigned": "Sin firmar", "signed": "Firmado" };
const status = { "draft": "Borrador", "final": "Final" };
const title = "Formularios";
const Employee_Management_Documents = {
  columns,
  emptyState,
  listLabel,
  signingStatus,
  status,
  title
};
export {
  columns,
  Employee_Management_Documents as default,
  emptyState,
  listLabel,
  signingStatus,
  status,
  title
};
