# taipu

JavaScript interface checking at runtime

## Installation

```bash
npm install UQ-eLIPSE/taipu
```

## Usage

```javascript
/// Importing

// ES Modules style
import { Taipu, or } from "taipu";

// CommonJS style
const TaipuPackage = require("taipu");
const Taipu = TaipuPackage.Taipu;
const or = TaipuPackage.or;


/// In your code...

// Primitive types are defined using their constructors
const BooleanType = new Taipu("BooleanType", Boolean);

// Other types of object are defined using their constructors as well
const DateType = new Taipu("DateType", Date);

// You can do type unions using the "or" function
// Taipu instances are also acceptable as a type
const StrNumBoolType = new Taipu("StrNumBoolType", or(String, Number, BooleanType));

// To define object interfaces, you can lay them out
const IUser = new Taipu("IUser", {
    username: String,
    password: String,

    fullName: or(String, null),

    // `undefined` also fits this object's property value when it doesn't have
    // the "dateOfBirth" property
    dateOfBirth: or(DateType, undefined)
});

// To check...
const booleanValue = true;
const numberValue = 42;
const dateObject = new Date();

const userObjectA = {
    username: "foo",
    password: "bar",
    fullName: "Foo Bar"
};
const userObjectB = {
    username: "hello",
    password: "world",
    fullName: null,
    dateOfBirth: new Date(1234567890123)
};
const userObjectC = {
    username: "bad",
    password: "user"
};

BooleanType.validate(booleanValue);     // { propChain: [], success: true, message: undefined }
BooleanType.validate(numberValue);      // { propChain: [], success: false, message: 'Taipu("BooleanType"): Value is not of type "boolean"' }

DateType.validate(dateObject);          // { propChain: [], success: true, message: undefined }
DateType.validate(userObjectA);         // { propChain: [], success: false, message: 'Taipu("DateType"): Value is not instance of "Date"' }

StrNumBoolType.validate(booleanValue);  // { propChain: [], success: true, message: undefined }
StrNumBoolType.validate(numberValue);   // { propChain: [], success: true, message: undefined }
StrNumBoolType.validate(""+dateObject); // { propChain: [], success: true, message: undefined }
StrNumBoolType.validate(dateObject);    // { propChain: [], success: false, message: 'Taipu("StrNumBoolType"): Value is not of type "(string | number | Taipu("BooleanType"))"' }

IUser.validate(userObjectA);            // { propChain: [], success: true, message: undefined }
IUser.validate(userObjectB);            // { propChain: [], success: true, message: undefined }
IUser.validate(userObjectC);            // { propChain: [ 'fullName' ], success: false, message: 'Taipu("IUser"): Value is not of type "(string | null)"' }
```

## Stuff to come

* Support for array checks
* More documentation
* Tests

## Notes

### TypeScript support

Because `taipu` is written in TypeScript and exports declaration files, you 
should get type support automatically.

### Use of ES2015/ES6 features

While `taipu` is compiled down to ES5 syntax and will generally run on most 
servers and clients, they will need the following features from ES2015/ES6 
polyfilled in your environment if they are not present:

* Symbol
* WeakSet

### Name of constructors

In some instances `taipu` will attempt to produce a string representation of
constructor functions, which depends on the ES2015 `Function.name` property.

Where this is not available a generic label will be used instead.
