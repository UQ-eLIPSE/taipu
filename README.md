# taipu
JavaScript interface checking at runtime

## Installation
```
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

    // `undefined` also fits when an object's property value when it doesn't
    // have the "dateOfBirth" property
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

BooleanType.validate(booleanValue);     // { success: true }
BooleanType.validate(numberValue);      // { success: false }

DateType.validate(dateObject);          // { success: true }
DateType.validate(userObjectA);         // { success: false }

StrNumBoolType.validate(booleanValue);  // { success: true }
StrNumBoolType.validate(numberValue);   // { success: true }
StrNumBoolType.validate(""+dateObject); // { success: true }
StrNumBoolType.validate(dateObject);    // { success: false }

IUser.validate(userObjectA);            // { success: true }
IUser.validate(userObjectB);            // { success: true }
IUser.validate(userObjectC);            // { success: false }
```

## Stuff to come
* Support for array checks
* More detailed validation results
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
