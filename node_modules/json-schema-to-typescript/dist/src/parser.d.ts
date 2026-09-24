import { JSONSchema4Type } from 'json-schema';
import { Options } from './';
import type { AST } from './types/AST';
import type { NormalizedJSONSchema, SchemaType } from './types/JSONSchema';
import { DereferencedPaths } from './resolver';
export type Processed = Map<NormalizedJSONSchema, Map<SchemaType, AST>>;
export type UsedNames = Set<string>;
export declare function parse(schema: NormalizedJSONSchema | JSONSchema4Type, options: Options, keyName?: string, processed?: Processed, usedNames?: Set<string>): AST;
/**
 * A schema that refers back to itself can only be emitted as a named declaration:
 * an anonymous type has no way to mention itself, so the generator would try to
 * inline it forever. Recursive schemas usually have a name by the time they get
 * here (a `title`, an `$id`, a key in `definitions`), but not always -- eg. a
 * self-referencing `oneOf` that lives outside of `definitions`, or the copy the
 * resolver makes of a definition wherever a `$ref` to it carries sibling keywords.
 *
 * Guarantees that every reference cycle in the AST passes through a named type, by
 * naming anonymous types where it has to: after the `$ref` they were dereferenced
 * from when there is one, else after the closest property key or `$ref` above them.
 */
export declare function nameAnonymousRecursiveTypes(ast: AST, processed: Processed, dereferencedPaths: DereferencedPaths, usedNames: UsedNames): void;
