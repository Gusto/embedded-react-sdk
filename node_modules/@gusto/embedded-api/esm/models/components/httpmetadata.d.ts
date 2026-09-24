import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
export type HTTPMetadata = {
    /**
     * Raw HTTP response; suitable for custom response parsing
     */
    response: Response;
    /**
     * Raw HTTP request; suitable for debugging
     */
    request: Request;
};
/** @internal */
export declare const HTTPMetadata$inboundSchema: z.ZodType<HTTPMetadata, z.ZodTypeDef, unknown>;
export declare function httpMetadataFromJSON(jsonString: string): SafeParseResult<HTTPMetadata, SDKValidationError>;
//# sourceMappingURL=httpmetadata.d.ts.map