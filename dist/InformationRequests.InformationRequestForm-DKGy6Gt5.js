const blockingAlert = { "description": "No podrás procesar la nómina hasta que recibamos la información solicitada a continuación.", "title": "Esta es una solicitud de bloqueo de nómina" };
const cta = { "close": "Cerrar", "submit": "Enviar respuesta" };
const fields = { "fileUpload": { "label": "Subir documento" }, "textAnswer": { "label": "Responde la pregunta anterior", "placeholder": "Tu respuesta" } };
const questionTypes = { "answer": "Respuesta requerida", "document": "Documento requerido" };
const title = "Solicitud de información";
const unsupported = { "contactSupport": "Por favor, comunícate con soporte", "generic": { "description": "Necesitamos más información que no podemos recopilar aquí.", "title": "Información adicional requerida" }, "persona": { "description": "Para garantizar la seguridad de tu cuenta, necesitamos información adicional para ayudar a verificar la identidad de tu firmante autorizado.", "title": "Verificar identidad" } };
const validation = { "fileRequired": "Por favor, sube un archivo", "required": "Este campo es obligatorio" };
const InformationRequests_InformationRequestForm = {
  blockingAlert,
  cta,
  fields,
  questionTypes,
  title,
  unsupported,
  validation
};
export {
  blockingAlert,
  cta,
  InformationRequests_InformationRequestForm as default,
  fields,
  questionTypes,
  title,
  unsupported,
  validation
};
