import { Taipu } from "./index";

export namespace InternalSymbol {
    export const Or = Symbol("OR");
}

export type TypeDefinition =
    // Undefined and null
    undefined |
    null |

    // Primitives
    StringConstructor |
    NumberConstructor |
    BooleanConstructor |
    SymbolConstructor |

    // Constructors for "classes" are functions
    Function |

    // Actual interfaces for objects are given by TypeDefinitionObjectInterface
    TypeDefinitionObjectInterface |

    // Type definition sets
    TypeDefinitionSet |

    // You can also use Taipu instances
    Taipu;

export interface TypeDefinitionObjectInterface {
    [prop: string]: TypeDefinition,
}

export type TypeDefinitionSet =
    TypeDefinitionSetOr;

export interface TypeDefinitionSetOr {
    __type: symbol,       // InternalSymbol.Or

    /** Set of types in type union */
    types: ReadonlyArray<Readonly<TypeDefinition>>,
}
