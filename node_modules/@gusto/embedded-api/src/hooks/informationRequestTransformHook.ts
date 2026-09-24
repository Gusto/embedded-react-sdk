import {
  BeforeRequestContext,
  BeforeRequestHook,
} from "./types.js";

/**
 * Transforms information request submissions from JSON with base64 files
 * to multipart/form-data with actual file uploads (required by Rails API).
 */
export class InformationRequestTransformHook implements BeforeRequestHook {
  async beforeRequest(
    hookCtx: BeforeRequestContext,
    request: Request
  ): Promise<Request> {
    if (hookCtx.operationID !== "submit-information-request") {
      return request;
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return request;
    }

    try {
      const body = await request.clone().json();
      const questions = body.required_questions;

      if (!Array.isArray(questions)) {
        return request;
      }

      const formData = new FormData();

      questions.forEach((item: any, index: number) => {
        formData.append(
          `required_questions[${index}][question_uuid]`,
          item.question_uuid
        );

        if (item.response_type === "document" && item.file_response) {
          const blob = this.base64ToBlob(item.file_response);
          formData.append(`required_questions[${index}][response]`, blob, item.file_name || "upload");
        } else {
          formData.append(
            `required_questions[${index}][response]`,
            item.text_response || ""
          );
        }
      });

      // Copy headers except content-type/content-length (let fetch auto-set for multipart)
      const headers = new Headers();
      request.headers.forEach((value, key) => {
        if (!["content-type", "content-length"].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });

      return new Request(request.url, {
        method: request.method,
        headers,
        body: formData,
      });
    } catch {
      return request;
    }
  }

  private base64ToBlob(base64: string): Blob {
    let data = base64;
    let mimeType = "application/octet-stream";

    // Extract MIME type from data URL: data:image/png;base64,xxxxx
    if (base64.startsWith("data:")) {
      const match = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1]!;
        data = match[2]!;
      }
    }

    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      buffer[i] = bytes.charCodeAt(i);
    }
    return new Blob([buffer], { type: mimeType });
  }
}
