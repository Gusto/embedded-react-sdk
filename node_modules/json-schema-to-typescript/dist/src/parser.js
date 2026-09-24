"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
exports.nameAnonymousRecursiveTypes = nameAnonymousRecursiveTypes;
const lodash_1 = require("lodash");
const util_1 = require("util");
const applySchemaTyping_1 = require("./applySchemaTyping");
const AST_1 = require("./types/AST");
const JSONSchema_1 = require("./types/JSONSchema");
const memoize_1 = require("./memoize");
const utils_1 = require("./utils");
function parse(schema, options, keyName, processed = new Map(), usedNames = new Set()) {
    if ((0, JSONSchema_1.isPrimitive)(schema)) {
        if ((0, JSONSchema_1.isBoolean)(schema)) {
            return parseBooleanSchema(schema, keyName, options);
        }
        return parseLiteral(schema, keyName);
    }
    const intersection = schema[JSONSchema_1.Intersection];
    const types = schema[JSONSchema_1.Types];
    if (intersection) {
        const ast = parseAsTypeWithCache(intersection, 'ALL_OF', options, keyName, processed, usedNames);
        types.forEach(type => {
            ast.params.push(parseAsTypeWithCache(schema, type, options, keyName, processed, usedNames));
        });
        (0, utils_1.log)('blue', 'parser', 'Types:', [...types], 'Input:', schema, 'Output:', ast);
        return ast;
    }
    if (types.size === 1) {
        const type = [...types][0];
        const ast = parseAsTypeWithCache(schema, type, options, keyName, processed, usedNames);
        (0, utils_1.log)('blue', 'parser', 'Type:', type, 'Input:', schema, 'Output:', ast);
        return ast;
    }
    throw new ReferenceError('Expected intersection schema. Please file an issue on GitHub.');
}
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
function nameAnonymousRecursiveTypes(ast, processed, dereferencedPaths, usedNames) {
    const refNames = new Map();
    processed.forEach((asts, schema) => {
        const name = (0, utils_1.justName)(dereferencedPaths.get(schema));
        if (name) {
            asts.forEach(_ => refNames.set(_, name));
        }
    });
    // The generator emits a named type by reference (and declares it separately), and
    // inlines everything else -- so it recurses forever exactly when some cycle is made
    // of anonymous types only. Walk the AST the same way: a named type ends the current
    // path and becomes a root of its own, so an edge that leads back into the current
    // path (past its root) closes an all-anonymous cycle. Name one of that edge's two
    // ends; every cycle through the edge contains both. A type named part-way through a
    // walk can hide a second cycle that shares its path but not that type, so walk
    // again until a walk finds nothing to name (one extra walk, in practice).
    let named;
    do {
        named = false;
        const done = new Set();
        const roots = [ast];
        const path = [];
        const visit = (node) => {
            var _a, _b;
            if (done.has(node)) {
                return;
            }
            if (path.length && (0, AST_1.hasStandaloneName)(node)) {
                roots.push(node);
                return;
            }
            const index = path.indexOf(node);
            if (index > -1) {
                if (!path.slice(index).some(AST_1.hasStandaloneName)) {
                    const target = pickEnd(node, path[path.length - 1]);
                    target.standaloneName = (0, utils_1.generateName)((_b = (_a = refNames.get(target)) !== null && _a !== void 0 ? _a : keyOf(target)) !== null && _b !== void 0 ? _b : closestName(path), usedNames);
                    named = true;
                }
                return;
            }
            path.push(node);
            subtrees(node).forEach(visit);
            path.pop();
            done.add(node);
        };
        while (roots.length) {
            visit(roots.pop());
        }
    } while (named);
    // Prefer the end that was reached through a `$ref` (the resolver's copies share
    // their children with the original, so a cycle through a copy is often entered at
    // a child rather than at the copy), then the end that isn't a list, so that the
    // alias reads `type Foo = string | Foo[]` rather than naming the array.
    function pickEnd(node, source) {
        if (refNames.has(node) !== refNames.has(source)) {
            return refNames.has(node) ? node : source;
        }
        return isList(node) && !isList(source) ? source : node;
    }
    // Last resort is the root the walk started from: the schema itself or a named type
    function closestName(path) {
        var _a, _b;
        const above = [...path].reverse();
        return (_b = (_a = above.map(_ => refNames.get(_)).find(Boolean)) !== null && _a !== void 0 ? _a : above.map(keyOf).find(Boolean)) !== null && _b !== void 0 ? _b : path[0].standaloneName;
    }
}
/** A node's property key -- ignoring the placeholder that array items get */
function keyOf(ast) {
    var _a;
    return ((_a = ast.keyName) === null || _a === void 0 ? void 0 : _a.includes('{keyNameFromDefinition}')) ? undefined : ast.keyName;
}
function isList(ast) {
    return ast.type === 'ARRAY' || ast.type === 'TUPLE';
}
function subtrees(ast) {
    switch (ast.type) {
        case 'ARRAY':
            return [ast.params];
        case 'INTERFACE':
            return ast.params.map(_ => _.ast).concat(ast.superTypes);
        case 'INTERSECTION':
        case 'UNION':
            return ast.params;
        case 'TUPLE':
            return ast.spreadParam ? ast.params.concat(ast.spreadParam) : ast.params;
        default:
            return [];
    }
}
function parseAsTypeWithCache(schema, type, options, keyName, processed = new Map(), usedNames = new Set()) {
    // If we've seen this node before, return it.
    let cachedTypeMap = processed.get(schema);
    if (!cachedTypeMap) {
        cachedTypeMap = new Map();
        processed.set(schema, cachedTypeMap);
    }
    const cachedAST = cachedTypeMap.get(type);
    if (cachedAST) {
        return cachedAST;
    }
    // Cache processed ASTs before they are actually computed, then update
    // them in place using set(). This is to avoid cycles.
    // TODO: Investigate alternative approaches (lazy-computing nodes, etc.)
    const ast = {};
    cachedTypeMap.set(type, ast);
    // Update the AST in place. This updates the `processed` cache, as well
    // as any nodes that directly reference the node.
    return Object.assign(ast, parseNonLiteral(schema, type, options, keyName, processed, usedNames));
}
function parseBooleanSchema(schema, keyName, options) {
    if (schema) {
        return {
            keyName,
            type: options.unknownAny ? 'UNKNOWN' : 'ANY',
        };
    }
    return {
        keyName,
        type: 'NEVER',
    };
}
function parseLiteral(schema, keyName) {
    return {
        keyName,
        params: schema,
        type: 'LITERAL',
    };
}
function parseNonLiteral(schema, type, options, keyName, processed, usedNames) {
    const definitions = getDefinitionsMemoized((0, JSONSchema_1.getRootSchema)(schema)); // TODO
    const keyNameFromDefinition = getDefinitionKeysMemoized(definitions).get(schema);
    switch (type) {
        case 'ALL_OF':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                // An `allOf` member made up entirely of keywords this tool doesn't implement (eg.
                // `if`/`then`/`else`, `not`) doesn't match any of the type matchers in `typesOfSchema`,
                // so it falls back to `newInterface`, which synthesizes a bare `{[k: string]: unknown}`
                // for it. Intersecting with that contributes no information, so drop it rather than
                // cluttering the output. Restricted to members with no keyword this tool does recognize,
                // so it never touches a member whose emptiness is due to its *own* type (eg. a bare
                // `{type: 'object'}`, or `{required: [...]}` with no matching `properties`) -- those stay
                // exactly as before.
                params: schema
                    .allOf.map(memberSchema => ({
                    ast: parse(memberSchema, options, undefined, processed, usedNames),
                    memberSchema,
                }))
                    .filter(({ ast, memberSchema }) => !(hasNoRecognizedKeywords(memberSchema) && isVacuousInterface(ast)))
                    .map(({ ast }) => ast),
                type: 'INTERSECTION',
            };
        case 'ANY':
            return Object.assign(Object.assign({}, (options.unknownAny ? AST_1.T_UNKNOWN : AST_1.T_ANY)), { comment: schema.description, deprecated: schema.deprecated, keyName, standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options) });
        case 'ANY_OF':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                params: schema.anyOf.map(_ => parse(_, options, undefined, processed, usedNames)),
                type: 'UNION',
            };
        case 'BOOLEAN':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'BOOLEAN',
            };
        case 'CUSTOM_TYPE':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                params: schema.tsType,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'CUSTOM_TYPE',
            };
        case 'NAMED_ENUM': {
            const enumName = standaloneName(schema, keyNameFromDefinition !== null && keyNameFromDefinition !== void 0 ? keyNameFromDefinition : keyName, usedNames, options);
            // A TypeScript enum declaration requires a name. In positions that supply
            // none (an `anyOf`/`oneOf` branch, say) fall back to a union of literals
            // rather than emitting a nameless `export enum { ... }`, which is invalid.
            if (!enumName) {
                return {
                    comment: schema.description,
                    deprecated: schema.deprecated,
                    keyName,
                    params: schema.enum.map(_ => parseLiteral(_, undefined)),
                    type: 'UNION',
                };
            }
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: enumName,
                params: schema.enum.map((_, n) => ({
                    ast: parseLiteral(_, undefined),
                    keyName: schema.tsEnumNames[n],
                })),
                type: 'ENUM',
            };
        }
        case 'NAMED_SCHEMA':
            return newInterface(schema, options, processed, usedNames, keyName);
        case 'NEVER':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'NEVER',
            };
        case 'NULL':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'NULL',
            };
        case 'NUMBER':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'NUMBER',
            };
        case 'OBJECT':
            return {
                comment: schema.description,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'OBJECT',
                deprecated: schema.deprecated,
            };
        case 'ONE_OF':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                params: schema.oneOf.map(_ => parse(_, options, undefined, processed, usedNames)),
                type: 'UNION',
            };
        case 'REFERENCE':
            throw Error((0, util_1.format)('Refs should have been resolved by the resolver!', schema));
        case 'STRING':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'STRING',
            };
        case 'TYPED_ARRAY':
            if (Array.isArray(schema.items)) {
                // normalised to not be undefined
                const minItems = schema.minItems;
                const maxItems = schema.maxItems;
                const arrayType = {
                    comment: schema.description,
                    deprecated: schema.deprecated,
                    keyName,
                    maxItems,
                    minItems,
                    standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                    params: schema.items.map(_ => parse(_, options, undefined, processed, usedNames)),
                    type: 'TUPLE',
                };
                if (schema.additionalItems === true) {
                    arrayType.spreadParam = options.unknownAny ? AST_1.T_UNKNOWN : AST_1.T_ANY;
                }
                else if (schema.additionalItems) {
                    arrayType.spreadParam = parse(schema.additionalItems, options, undefined, processed, usedNames);
                }
                return arrayType;
            }
            else {
                return {
                    comment: schema.description,
                    deprecated: schema.deprecated,
                    keyName,
                    standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                    params: parse(schema.items, options, `{keyNameFromDefinition}Items`, processed, usedNames),
                    type: 'ARRAY',
                };
            }
        case 'UNION':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                params: schema.type.map(type => {
                    const member = Object.assign(Object.assign({}, (0, lodash_1.omit)(schema, '$id', 'description', 'title')), { type });
                    (0, utils_1.maybeStripDefault)(member);
                    (0, applySchemaTyping_1.applySchemaTyping)(member);
                    return parse(member, options, undefined, processed, usedNames);
                }),
                type: 'UNION',
            };
        case 'UNNAMED_ENUM':
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                params: schema.enum.map(_ => parseLiteral(_, undefined)),
                type: 'UNION',
            };
        case 'UNNAMED_SCHEMA':
            return newInterface(schema, options, processed, usedNames, keyName, keyNameFromDefinition);
        case 'UNTYPED_ARRAY':
            // normalised to not be undefined
            const minItems = schema.minItems;
            const maxItems = typeof schema.maxItems === 'number' ? schema.maxItems : -1;
            const params = options.unknownAny ? AST_1.T_UNKNOWN : AST_1.T_ANY;
            if (minItems > 0 || maxItems >= 0) {
                return {
                    comment: schema.description,
                    deprecated: schema.deprecated,
                    keyName,
                    maxItems: schema.maxItems,
                    minItems,
                    // create a tuple of length N
                    params: Array(Math.max(maxItems, minItems) || 0).fill(params),
                    // if there is no maximum, then add a spread item to collect the rest
                    spreadParam: maxItems >= 0 ? undefined : params,
                    standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                    type: 'TUPLE',
                };
            }
            return {
                comment: schema.description,
                deprecated: schema.deprecated,
                keyName,
                params,
                standaloneName: standaloneName(schema, keyNameFromDefinition, usedNames, options),
                type: 'ARRAY',
            };
    }
}
// Keywords that some matcher in `typesOfSchema`, or the `additionalProperties`/`required`
// normalizer rules, actually keys off of. An `allOf` member made up exclusively of keywords
// outside this list (eg. `if`/`then`/`else`, `not`) is one this tool has no notion of at all,
// as opposed to eg. a bare `{type: 'object'}`, which the tool does recognize but currently
// renders no differently -- that distinction keeps `hasNoRecognizedKeywords` from also
// swallowing members whose current (separately unimplemented) behavior other schemas rely on.
// (`$ref` is deliberately omitted: by the time this runs, the resolver has already replaced
// every `$ref` node, so `case 'REFERENCE'` above never fires and no schema here can carry one.)
// Keep this in sync with the keywords `typesOfSchema.ts`'s matchers check.
const RECOGNIZED_ALL_OF_MEMBER_KEYWORDS = new Set([
    '$id',
    'additionalProperties',
    'allOf',
    'anyOf',
    'const',
    'default',
    'enum',
    'extends',
    'items',
    'oneOf',
    'patternProperties',
    'properties',
    'required',
    'tsEnumNames',
    'tsType',
    'type',
]);
function hasNoRecognizedKeywords(schema) {
    return Object.keys(schema).every(key => !RECOGNIZED_ALL_OF_MEMBER_KEYWORDS.has(key));
}
/**
 * True for a parsed AST that carries no information beyond the synthesized
 * `[k: string]: unknown`/`any` index signature `parseSchema` adds by default -- ie. an interface
 * with no properties, patternProperties, superTypes, comment, or standalone name of its own.
 * @see https://github.com/bcherny/json-schema-to-typescript/issues/369
 */
function isVacuousInterface(ast) {
    return (ast.type === 'INTERFACE' &&
        ast.standaloneName === undefined &&
        ast.comment === undefined &&
        !ast.deprecated &&
        ast.superTypes.length === 0 &&
        ast.params.length === 1 &&
        ast.params[0].isIndexSignature &&
        (ast.params[0].ast.type === 'ANY' || ast.params[0].ast.type === 'UNKNOWN'));
}
/**
 * Compute a schema name using a series of fallbacks
 */
function standaloneName(schema, keyNameFromDefinition, usedNames, options) {
    var _a;
    const name = ((_a = options.customName) === null || _a === void 0 ? void 0 : _a.call(options, schema, keyNameFromDefinition)) || schema.title || schema.$id || keyNameFromDefinition;
    if (name) {
        return (0, utils_1.generateName)(name, usedNames);
    }
}
function newInterface(schema, options, processed, usedNames, keyName, keyNameFromDefinition) {
    const name = standaloneName(schema, keyNameFromDefinition, usedNames, options);
    return {
        comment: schema.description,
        deprecated: schema.deprecated,
        keyName,
        params: parseSchema(schema, options, processed, usedNames, name),
        standaloneName: name,
        superTypes: parseSuperTypes(schema, options, processed, usedNames),
        type: 'INTERFACE',
    };
}
function parseSuperTypes(schema, options, processed, usedNames) {
    // Type assertion needed because of dereferencing step
    // TODO: Type it upstream
    const superTypes = schema.extends;
    if (!superTypes) {
        return [];
    }
    return superTypes.map(_ => parse(_, options, undefined, processed, usedNames));
}
/**
 * Draft 4+ lists an object's required properties on the object schema (`required: [...]`).
 * Draft 3 instead flagged each property schema (`required: true`), and some generators still
 * emit that form. Support both, reading the draft 3 form only when it is strictly `true` so
 * that a property's own `required` array (which of *its* properties are required) is never
 * mistaken for the flag.
 */
function isRequired(parentSchema, key, propertySchema) {
    return propertySchema.required === true || (parentSchema.required !== true && (0, lodash_1.includes)(parentSchema.required, key));
}
/**
 * Helper to parse schema properties into params on the parent schema's type
 */
function parseSchema(schema, options, processed, usedNames, parentSchemaName) {
    const asts = (0, lodash_1.map)(schema.properties, (value, key) => ({
        ast: parse(value, options, key, processed, usedNames),
        isIndexSignature: false,
        isPatternProperty: false,
        isRequired: isRequired(schema, key, value),
        isUnreachableDefinition: false,
        keyName: key,
    }));
    // rendered through the index signature (below), not as params of their own
    const patternProperties = (0, lodash_1.map)(schema.patternProperties, (value, key) => {
        const ast = parse(value, options, key, processed, usedNames);
        const comment = `This interface was referenced by \`${parentSchemaName}\`'s JSON-Schema definition
via the \`patternProperty\` "${key.replace('*/', '*\\/')}".`;
        ast.comment = ast.comment ? `${ast.comment}\n\n${comment}` : comment;
        return {
            ast,
            isIndexSignature: false,
            isPatternProperty: true,
            isRequired: isRequired(schema, key, value),
            isUnreachableDefinition: false,
            keyName: key,
        };
    });
    const unreachableDefinitions = !options.unreachableDefinitions
        ? []
        : (0, lodash_1.map)(schema.$defs, (value, key) => {
            const ast = parse(value, options, key, processed, usedNames);
            const comment = `This interface was referenced by \`${parentSchemaName}\`'s JSON-Schema
via the \`definition\` "${key}".`;
            ast.comment = ast.comment ? `${ast.comment}\n\n${comment}` : comment;
            ast.isUnreachableDefinition = true;
            return {
                ast,
                isIndexSignature: false,
                isPatternProperty: false,
                isRequired: isRequired(schema, key, value),
                isUnreachableDefinition: true,
                keyName: key,
            };
        });
    // TypeScript cannot constrain keys by regex, so patternProperties are folded into the one
    // string index signature, typed as the union of their value types:
    let declaredOnly = []; // listed only so that their named types get declared
    let indexSignatureMembers;
    switch (schema.additionalProperties) {
        case true: // already admits every value; the patterns are listed only to get their named types declared
            declaredOnly = patternProperties;
            indexSignatureMembers = [];
            break;
        case undefined: // validate against the patterns alone, as if it were `false`
        case false:
            indexSignatureMembers = patternProperties;
            break;
        default:
            indexSignatureMembers = patternProperties.concat({
                ast: parse(schema.additionalProperties, options, '[k: string]', processed, usedNames),
                isIndexSignature: false,
                isPatternProperty: true,
                isRequired: false,
                isUnreachableDefinition: false,
                keyName: '[k: string]',
            });
    }
    if (!indexSignatureMembers.length && schema.additionalProperties === false) {
        return asts.concat(unreachableDefinitions);
    }
    const members = indexSignatureMembers.map(_ => _.ast);
    let indexSignature;
    if (!members.length) {
        indexSignature = options.unknownAny ? AST_1.T_UNKNOWN_ADDITIONAL_PROPERTIES : AST_1.T_ANY_ADDITIONAL_PROPERTIES;
    }
    else if (members.length === 1) {
        indexSignature = members[0];
    }
    else {
        indexSignature = {
            // Members with a standalone name carry their comment on their own declaration;
            // the others' comments (which name their pattern) go on the index signature.
            comment: members
                .filter(_ => !(0, AST_1.hasStandaloneName)(_) && _.comment)
                .map(_ => _.comment)
                .join('\n\n') || undefined,
            keyName: '[k: string]',
            type: 'UNION',
            params: members,
        };
    }
    // pass "true" for isRequired because in TS, properties
    // defined via index signatures are already optional
    const indexSignatureParam = {
        ast: indexSignature,
        isIndexSignature: true,
        isPatternProperty: false,
        isRequired: true,
        isUnreachableDefinition: false,
        keyName: '[k: string]',
    };
    // The members of a union are also listed as non-rendered params, so that their named types are
    // still declared when the optimizer collapses it (e.g. `X | unknown` to `unknown`). They go
    // after the index signature: the optimizer rewrites only the first param that holds a given AST.
    if (indexSignatureMembers.length > 1) {
        declaredOnly = indexSignatureMembers;
    }
    // Declaration order as on master: types from patternProperties before unreachable definitions,
    // a signature that comes from additionalProperties alone after them.
    return patternProperties.length
        ? asts.concat(indexSignatureParam, declaredOnly, unreachableDefinitions)
        : asts.concat(unreachableDefinitions, indexSignatureParam);
}
function getDefinitions(schema, isSchema = true, processed = new Set()) {
    if (processed.has(schema)) {
        return {};
    }
    processed.add(schema);
    if (Array.isArray(schema)) {
        return schema.reduce((prev, cur) => (Object.assign(Object.assign({}, prev), getDefinitions(cur, false, processed))), {});
    }
    if ((0, lodash_1.isPlainObject)(schema)) {
        return Object.assign(Object.assign({}, (isSchema && hasDefinitions(schema) ? schema.$defs : {})), Object.keys(schema).reduce((prev, cur) => (Object.assign(Object.assign({}, prev), getDefinitions(schema[cur], false, processed))), {}));
    }
    return {};
}
const getDefinitionsMemoized = (0, memoize_1.memoize)(getDefinitions);
/**
 * Reverse index of `getDefinitions`: schema -> the first definition key that holds it,
 * built once per definitions object instead of scanning every key for every parsed node.
 */
const getDefinitionKeysMemoized = (0, memoize_1.memoize)((definitions) => {
    const keys = new Map();
    for (const key of Object.keys(definitions)) {
        if (!keys.has(definitions[key])) {
            keys.set(definitions[key], key);
        }
    }
    return keys;
});
/**
 * TODO: Reduce rate of false positives
 */
function hasDefinitions(schema) {
    return '$defs' in schema;
}
//# sourceMappingURL=parser.js.map