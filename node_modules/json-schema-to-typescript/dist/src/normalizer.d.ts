import { JSONSchema, LinkedJSONSchema, NormalizedJSONSchema } from './types/JSONSchema';
import { Options } from './';
import { DereferencedPaths } from './resolver';
/**
 * `nullable` next to a `$ref` has to be rewritten before dereferencing, while it still
 * visibly belongs to the referencing schema: the ref parser folds `$ref` siblings into a
 * copy of the target, where it would read as if the target itself were nullable (and
 * the copy would be emitted as a second, identical type). Everything else waits for the
 * rule above, which also reaches schemas in other files, once dereferencing has pulled
 * them in.
 */
export declare function normalizeNullableRefs(schema: JSONSchema): void;
export declare function normalize(rootSchema: LinkedJSONSchema, dereferencedPaths: DereferencedPaths, filename: string, options: Options): NormalizedJSONSchema;
