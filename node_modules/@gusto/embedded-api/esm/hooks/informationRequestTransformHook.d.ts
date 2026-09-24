import { BeforeRequestContext, BeforeRequestHook } from "./types.js";
/**
 * Transforms information request submissions from JSON with base64 files
 * to multipart/form-data with actual file uploads (required by Rails API).
 */
export declare class InformationRequestTransformHook implements BeforeRequestHook {
    beforeRequest(hookCtx: BeforeRequestContext, request: Request): Promise<Request>;
    private base64ToBlob;
}
//# sourceMappingURL=informationRequestTransformHook.d.ts.map