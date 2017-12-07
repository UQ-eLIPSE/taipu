import { Taipu } from "./index";
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
    function CreatePartialType(taipu: Taipu): Taipu;
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
     * Runs validation of the value against the type definition.
     *
     * @param typeDefinition Type definition
     * @param value Value to test
     */
    function Validate(typeDefinition: Readonly<TypeDefinition>, value: any): boolean;
    function ValidateUndefined(value: any): boolean;
    function ValidateNull(value: any): boolean;
    function ValidateString(value: any): boolean;
    function ValidateNumber(value: any): boolean;
    function ValidateBoolean(value: any): boolean;
    function ValidateSymbol(value: any): boolean;
    function ValidateInstanceOf(constructor: Function, value: any): boolean;
    function ValidateObjectInterface(objInterface: TypeDefinitionObjectInterface, value: any): boolean;
    function ValidateTypeUnion(typeUnion: TypeDefinitionSetOr, value: any): boolean;
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
