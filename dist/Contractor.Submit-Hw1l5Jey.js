const documentRequirements = { "alertLabel": "El gobierno requiere que tenga el Formulario W-9 completado y firmado.", "description": "Deberá recopilar copias firmadas de los siguientes documentos de {{contractorName}}.", "documents": { "taxpayer_identification_form_w_9": { "description": "Verifica la identidad de su contratista para fines de impuestos, como generar su Formulario 1099.", "title": "Identificación del contribuyente (Formulario W-9)" } } };
const doneCta = "Listo";
const doneDescription = "Este contratista se ha incorporado correctamente.";
const doneTitle = "Contratista incorporado";
const heading = "Enviar contratista";
const inviteContractor = { "description": "Está invitando a un contratista a completar el flujo de incorporación. Por favor, verifique bien que haya ingresado correctamente los datos de este contratista." };
const submitCta = "Enviar y completar incorporación";
const submitDone = { "successMessage": "¡El contratista ha sido incorporado!" };
const title = "Tenga en cuenta que después de enviar";
const warningItems = ["El tipo de contratista no se puede cambiar.", "El informe de nueva contratación no se puede modificar."];
const Contractor_Submit = {
  documentRequirements,
  doneCta,
  doneDescription,
  doneTitle,
  heading,
  inviteContractor,
  submitCta,
  submitDone,
  title,
  warningItems
};
export {
  Contractor_Submit as default,
  documentRequirements,
  doneCta,
  doneDescription,
  doneTitle,
  heading,
  inviteContractor,
  submitCta,
  submitDone,
  title,
  warningItems
};
