import { Taipu } from "./index";
export declare namespace InternalSymbol {
    const Or: symbol;
}
export declare type TypeDefinition = undefined | null | StringConstructor | NumberConstructor | BooleanConstructor | SymbolConstructor | Function | TypeDefinitionObjectInterface | TypeDefinitionSet | Taipu;
export interface TypeDefinitionObjectInterface {
    [prop: string]: TypeDefinition;
}
export declare type TypeDefinitionSet = TypeDefinitionSetOr;
export interface TypeDefinitionSetOr {
    __type: symbol;
    /** Set of types in type union */
    types: ReadonlyArray<Readonly<TypeDefinition>>;
}
