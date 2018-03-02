import { Taipu } from "./index";
import { PropChain } from "./PropChain";
import { ValidationResult } from "./ValidationResult";
import { TypeDefinition, TypeDefinitionObjectInterface, TypeDefinitionSetOr } from "./TypeDefinition";
export declare namespace TaipuStatic {
    /**
     * Registers the Taipu instance in the set of known Taipu instances.
     *
     * @param instance Taipu instance
     */
    function RegisterTaipuInstance(instance: Taipu): Taipu<any>;
    /**
     * Determines if the value is a Taipu instance by checking if it is in the
     * set of known Taipu instances.
     *
     * @param value Value to test
     */
    function IsTaipuInstance(value: any): value is Taipu;
    /**
     * Registers the object interface type definition in the set of known object
     * interfaces.
     *
     * @param interfaceDesc Object interface type definition
     */
    function RegisterTypeDefinitionObjectInterface(interfaceDesc: TypeDefinitionObjectInterface): TypeDefinitionObjectInterface;
    /**
     * Creates a type union type definition from all supplied types.
     *
     * @param types All types to include in the type union
     */
    function CreateTypeUnion(...types: Readonly<TypeDefinition>[]): TypeDefinitionSetOr;
    /**
     * Translates a type definition or Taipu instance to one which accepts
     * `undefined` on its properties.
     *
     * @param typeDefinition A Taipu instance or type definition object
     */
    function CreatePartialType<T>(taipu: Taipu<T>): Taipu<Partial<T>>;
    function CreatePartialType(typeDefinition: TypeDefinitionObjectInterface): TypeDefinitionObjectInterface;
    function CreatePartialType(typeDefinition: TypeDefinitionSetOr): TypeDefinitionSetOr;
    function CreatePartialType(typeDefinition: TypeDefinition): TypeDefinition;
    /**
     * Returns the string representation of the given type.
     *
     * @param typeDefinition Given type to get name of
     */
    function GetTypeName(typeDefinition: Readonly<TypeDefinition>): string;
    /**
     * Returns the name of the function, where available.
     *
     * @param fn Given function to get name of
     */
    function GetFunctionName(fn: Function): string;
    /**
     * Returns a string representation of a type union.
     *
     * @param typeUnion
     */
    function GetTypeUnionName(typeUnion: TypeDefinitionSetOr): string;
    /**
     * Runs validation of the value against the type definition.
     *
     * @param typeDefinition Type definition
     * @param value Value to test
     * @param propChain Property access chain
     */
    function Validate(typeDefinition: Readonly<TypeDefinition>, value: any, propChain?: PropChain): ValidationResult;
    function ValidateUndefined(value: any, propChain: PropChain): ValidationResult;
    function ValidateNull(value: any, propChain: PropChain): ValidationResult;
    function ValidateString(value: any, propChain: PropChain): ValidationResult;
    function ValidateNumber(value: any, propChain: PropChain): ValidationResult;
    function ValidateBoolean(value: any, propChain: PropChain): ValidationResult;
    function ValidateSymbol(value: any, propChain: PropChain): ValidationResult;
    function ValidateInstanceOf(constructor: Function, value: any, propChain: PropChain): ValidationResult;
    function ValidateObjectInterface(objInterface: TypeDefinitionObjectInterface, value: any, propChain: PropChain): ValidationResult;
    function ValidateTypeUnion(typeUnion: TypeDefinitionSetOr, value: any, propChain: PropChain): ValidationResult;
    function IsTypeDefinitionUndefined(typeDefinition: any): typeDefinition is undefined;
    function IsTypeDefinitionNull(typeDefinition: any): typeDefinition is null;
    function IsTypeDefinitionString(typeDefinition: any): typeDefinition is StringConstructor;
    function IsTypeDefinitionNumber(typeDefinition: any): typeDefinition is NumberConstructor;
    function IsTypeDefinitionBoolean(typeDefinition: any): typeDefinition is BooleanConstructor;
    function IsTypeDefinitionSymbol(typeDefinition: any): typeDefinition is SymbolConstructor;
    function IsTypeDefinitionConstructor(typeDefinition: any): typeDefinition is Function;
    function IsTypeDefinitionObjectInterface(typeDefinition: any): typeDefinition is TypeDefinitionObjectInterface;
    function IsTypeDefinitionSetOr(typeDefinition: any): typeDefinition is TypeDefinitionSetOr;
}
