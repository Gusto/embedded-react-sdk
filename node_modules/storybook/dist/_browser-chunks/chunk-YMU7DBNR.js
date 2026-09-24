// src/shared/open-service/toolset-definition.ts
function defineToolset(definition) {
  return definition;
}
function resolveToolsetDescription(description, context) {
  return typeof description == "function" ? description(context) : description;
}
async function reportToolsetTelemetry(context, event, payload) {
  try {
    await context.telemetry?.(event, payload);
  } catch {
  }
}

export {
  defineToolset,
  resolveToolsetDescription,
  reportToolsetTelemetry
};
