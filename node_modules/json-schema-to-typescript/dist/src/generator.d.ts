import { Options } from './index';
import { AST } from './types/AST';
export declare function generate(ast: AST, options?: Options): string;
export declare const generateType: (a: AST, options: Options) => string;
