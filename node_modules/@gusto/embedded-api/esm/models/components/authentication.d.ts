import * as z from "zod/v3";
import { Result as SafeParseResult } from "../../types/fp.js";
import { SDKValidationError } from "../errors/sdkvalidationerror.js";
import { CreateTokenAuthentication } from "./createtokenauthentication.js";
import { RefreshTokenAuthentication } from "./refreshtokenauthentication.js";
export type Authentication = CreateTokenAuthentication | RefreshTokenAuthentication;
/** @internal */
export declare const Authentication$inboundSchema: z.ZodType<Authentication, z.ZodTypeDef, unknown>;
export declare function authenticationFromJSON(jsonString: string): SafeParseResult<Authentication, SDKValidationError>;
//# sourceMappingURL=authentication.d.ts.map