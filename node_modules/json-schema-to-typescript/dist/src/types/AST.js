"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.T_UNKNOWN_ADDITIONAL_PROPERTIES = exports.T_UNKNOWN = exports.T_ANY_ADDITIONAL_PROPERTIES = exports.T_ANY = void 0;
exports.hasComment = hasComment;
exports.hasStandaloneName = hasStandaloneName;
exports.omitStandaloneName = omitStandaloneName;
const lodash_1 = require("lodash");
function hasComment(ast) {
    return (('comment' in ast && ast.comment != null && ast.comment !== '') ||
        // Compare to true because ast.deprecated might be undefined
        ('deprecated' in ast && ast.deprecated === true));
}
function hasStandaloneName(ast) {
    return 'standaloneName' in ast && ast.standaloneName != null && ast.standaloneName !== '';
}
// TODO: More clearly disambiguate standalone names vs. aliased names instead.
// Note: enums are kept as-is — an ENUM without its standaloneName is unrenderable.
function omitStandaloneName(ast) {
    switch (ast.type) {
        case 'ENUM':
            return ast;
        default:
            return (0, lodash_1.omit)(ast, 'standaloneName');
    }
}
////////////////////////////////////////////     literals
exports.T_ANY = {
    type: 'ANY',
};
exports.T_ANY_ADDITIONAL_PROPERTIES = {
    keyName: '[k: string]',
    type: 'ANY',
};
exports.T_UNKNOWN = {
    type: 'UNKNOWN',
};
exports.T_UNKNOWN_ADDITIONAL_PROPERTIES = {
    keyName: '[k: string]',
    type: 'UNKNOWN',
};
//# sourceMappingURL=AST.js.map