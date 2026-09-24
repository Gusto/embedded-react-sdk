"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dereference = dereference;
const json_schema_ref_parser_1 = require("@apidevtools/json-schema-ref-parser");
const lodash_1 = require("lodash");
const utils_1 = require("./utils");
/**
 * $RefParser can't correctly dereference a schema whose root is itself a
 * `$ref`: it leaves `$ref: "#"` behind on the root instead of resolving it,
 * which trips the parser's "Refs should have been resolved by the resolver!"
 * invariant downstream. This holds regardless of what the `$ref` ultimately
 * points at -- a plain schema (#132) or another `$ref` (#740) -- so resolve
 * the root's own `$ref` chain ourselves first, via plain in-document JSON
 * Pointer lookups, before handing the schema off to $RefParser to resolve
 * everything else (which it does correctly once the root itself isn't a
 * `$ref`). Only *internal* pointers (`#/...`) are handled here, since those
 * are the only ones affected; a root `$ref` to an external file/URL is left
 * for $RefParser to resolve, as before.
 */
function resolveRootRef(schema) {
    if (!(0, lodash_1.isPlainObject)(schema) || typeof schema.$ref !== 'string' || !schema.$ref.startsWith('#/')) {
        return;
    }
    // Pointer lookups always walk this pristine snapshot of the original top level,
    // never the live `schema` we're mutating below -- otherwise a target merged in by
    // an earlier hop could shadow a same-named container (e.g. its own nested
    // `definitions`) and cause a later hop to resolve against the wrong one.
    const documentRoot = Object.assign({}, schema);
    // A key wins over any same-named key pulled in from a hop further down the chain,
    // starting with the root's own keys and then growing as each hop's keys are
    // claimed -- so the closest schema to the root always wins ties, matching how
    // $RefParser itself merges a `$ref` with sibling keywords everywhere else.
    const claimedKeys = new Set(Object.keys(schema).filter(key => key !== '$ref'));
    const seenPointers = new Set();
    while ((0, lodash_1.isPlainObject)(schema) && typeof schema.$ref === 'string' && schema.$ref.startsWith('#/')) {
        const pointer = schema.$ref;
        if (seenPointers.has(pointer)) {
            break; // circular root $ref; fall through to the same crash this had before this fix
        }
        seenPointers.add(pointer);
        const target = pointer
            .slice(2)
            .split('/')
            .reduce((node, segment) => {
            if (!(0, lodash_1.isPlainObject)(node) && !Array.isArray(node)) {
                return undefined;
            }
            const key = safeDecodeURIComponent(segment.replace(/~1/g, '/').replace(/~0/g, '~'));
            // Only an own property is a real JSON Pointer match -- otherwise a segment
            // like `__proto__` would resolve via the prototype chain instead of failing.
            return Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined;
        }, documentRoot);
        if (!(0, lodash_1.isPlainObject)(target)) {
            break; // not a plain-object pointer into this document; let $RefParser handle/report it
        }
        delete schema.$ref;
        for (const [key, value] of Object.entries(target)) {
            if (key === '$ref') {
                setOwn(schema, key, value);
            }
            else if (!claimedKeys.has(key)) {
                setOwn(schema, key, value);
                claimedKeys.add(key);
            }
        }
    }
}
// A JSON Pointer segment isn't guaranteed to be a valid percent-encoding (it may
// contain a literal, unescaped `%`), so fall back to the raw segment rather than
// letting decodeURIComponent throw.
function safeDecodeURIComponent(segment) {
    try {
        return decodeURIComponent(segment);
    }
    catch (_a) {
        return segment;
    }
}
// Schema keys are attacker/document-controlled and may include names like
// `__proto__`: plain `obj[key] = value` assignment goes through the prototype
// chain's setters, so a `__proto__` key would reassign obj's actual prototype
// instead of setting a data property. Define the property directly instead.
function setOwn(obj, key, value) {
    Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
}
function dereference(schema_1, _a) {
    return __awaiter(this, arguments, void 0, function* (schema, { cwd, $refOptions }) {
        resolveRootRef(schema);
        (0, utils_1.log)('green', 'dereferencer', 'Dereferencing input schema:', cwd, schema);
        const parser = new json_schema_ref_parser_1.$RefParser();
        const dereferencedPaths = new WeakMap();
        const dereferencedSchema = (yield parser.dereference(cwd, schema, Object.assign(Object.assign({}, $refOptions), { dereference: Object.assign(Object.assign({}, $refOptions.dereference), { onDereference($ref, schema) {
                    dereferencedPaths.set(schema, $ref);
                } }) }))); // TODO: fix types
        return { dereferencedPaths, dereferencedSchema: resolveNamedAnchors(dereferencedSchema) };
    });
}
// A JSON Pointer fragment always starts with "#/" (or is exactly "#"); anything
// else after the "#" is a draft-07 style plain-name anchor.
function isAnchorRef($ref) {
    return $ref.startsWith('#') && $ref !== '#' && !$ref.startsWith('#/');
}
// These keywords hold plain data, never a nested schema, so `$id`/`$ref` found
// underneath them must not be treated as anchors/anchor-refs.
const NON_SCHEMA_KEYS = new Set(['enum', 'const', 'default', 'examples']);
/**
 * @apidevtools/json-schema-ref-parser only resolves `$ref`s that are JSON Pointers
 * (`#/...`). It has no support for draft-07 style named anchors, where a subschema
 * declares `$id: "#name"` and other parts of the document reference it via
 * `$ref: "#name"` -- those `$ref`s are left completely untouched by the parser
 * (@see https://github.com/APIDevTools/json-schema-ref-parser/issues/97), and would
 * otherwise crash the parser downstream.
 *
 * Find every such anchor in the already-dereferenced schema, and rewrite any matching
 * `$ref` in place to point at the same schema node -- the same substitution the
 * ref-parser itself performs for an ordinary (possibly circular) JSON Pointer `$ref`,
 * which the rest of the pipeline already knows how to handle. Returns the (possibly
 * new) root schema, in case the root itself was a named-anchor `$ref`.
 */
function resolveNamedAnchors(schema) {
    const anchors = new Map();
    eachSchemaNode(schema, node => {
        if (typeof node.$id === 'string' && isAnchorRef(node.$id) && !anchors.has(node.$id)) {
            anchors.set(node.$id, node);
        }
    });
    if (!anchors.size) {
        return schema;
    }
    // An anchor's own node can itself be an alias for another anchor
    // (`$id: "#b", $ref: "#a"`); follow those chains up front so every map entry
    // ends up pointing at a concrete (non-`$ref`) node.
    function resolveChain($ref, seen = new Set()) {
        const node = anchors.get($ref);
        if (typeof node.$ref === 'string' && anchors.has(node.$ref) && !seen.has($ref)) {
            return resolveChain(node.$ref, seen.add($ref));
        }
        return node;
    }
    for (const name of anchors.keys()) {
        anchors.set(name, resolveChain(name));
    }
    let resolvedRoot = schema;
    eachSchemaNode(schema, (node, replace) => {
        if (typeof node.$ref === 'string' && anchors.has(node.$ref)) {
            const target = anchors.get(node.$ref);
            if (node === schema) {
                resolvedRoot = target;
            }
            replace(target);
        }
    });
    return resolvedRoot;
}
/**
 * Walks every object/array reachable from `schema`, invoking `visit` on each plain
 * object node found in a schema-bearing position. `replace` swaps the node out in
 * its parent container, in place (a no-op for the root node, which has no parent).
 *
 * The same node object can be reachable from more than one parent/key (eg. two
 * schemas sharing a `$ref` node via a YAML alias, or a node the ref-parser already
 * folded into a cycle), so `visit` runs for every occurrence. Only the recursion
 * into a node's children is guarded against repeating -- via `seen` -- to keep
 * cycles from looping forever.
 */
function eachSchemaNode(schema, visit, seen = new Set(), parent, key) {
    if (!schema || typeof schema !== 'object') {
        return;
    }
    if (!Array.isArray(schema)) {
        visit(schema, nextNode => {
            if (parent) {
                parent[key] = nextNode;
            }
        });
    }
    if (seen.has(schema)) {
        return;
    }
    seen.add(schema);
    for (const childKey of Object.keys(schema)) {
        if (NON_SCHEMA_KEYS.has(childKey)) {
            continue;
        }
        eachSchemaNode(schema[childKey], visit, seen, schema, childKey);
    }
}
//# sourceMappingURL=resolver.js.map