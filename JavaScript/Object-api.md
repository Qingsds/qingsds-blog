## Object.prototype

是所有对象的**原型**,其他对象通过对该属性添加东西来实现它们的继承关系

```js
let qingsds = new String("qingsds");
Object.prototype.custom = "something";
console.log(qingsds.custom); //something
```

### Object.prototype.constructor

`constructor`指向函数对象的构造器,这里是`Object()`

```js
Object.prototype.constructor === Object; // true
let obj = new Object();
obj.constructor === Object; // true
```

### Object.prototype.toString()

返回一个用于描述目标对象的字符串,当目标是一个 Number 对象时,可以传递一个用于进制的参数`radix`默认为 10

```js
let obj = { name: "qingsds" };
obj.toString(); // '[object Object]'
let num = new Number(123);
num.toString(123); //'123'
```

### Object.prototype.valueOf

该方法返回的事用基本类型表示的 `this` 的值(如果可以用基本类型表示),例如 `Number`, `Date` 返回一个时间戳,若无法用基本数据类型标识,会返回 `this` 本身

[详细转换规则](JavaScript类型转换.md)

### Object.prototype.hasOwnProperty(prop)

当目标属性为对象自身属性时返回 `true`,若是从原型链中继承或不存在返回 `false`

### Object.prototype.isPrototypeOf(obj)

当目标对象是当前对象的原型时返回 `true`(原型链上的都可以)

```js
let string = new String("");
Object.prototype.isPrototypeOf(string); //true
String.prototype.isPrototypeOf(string); // true
Array.prototype.isPrototypeOf(string); // false
```

### Object.prototype.propertyIsEnumerable(prop)

如果目标属性能在`for in`循环被显示出来,就返回 true

## ES5&ES6 中加入的 Object 属性

### Object.defineProperty(obj, prop, descriptor)

`Object.defineProperty` 设置的原型对象上的属性不会被修改

[MDN]('https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty')

```js
function App() {
  console.log("test App");
}
function http() {
  console.log("http接口");
}
// App.prototype.$http = http;
Object.defineProperty(App.prototype, "$http", {
  get() {
    return http;
  },
});
let app = new App();
app.$http();
app.$http = 1; //修改不会生效
app.$http();
```

### Object.defineProperties(obj,props)

与 `defineProperty` 用法基本相同,可以用来一次定义多个属性

```js
var glass = Object.defineProperties(App.prototype, {
  color: {
    value: "transparent",
    writable: true,
  },
  fullness: {
    value: "half",
    writable: false,
  },
});
glass.fullness; // half
```

### Object.getPrototypeOf(obj)

查询对象的原型

### Object.create(obj,descr)

创建一个新对象,并为其设置原型和属性描述(对象的属性)

```js
var People = { name: "people" };
var child = Object.create(People, {
  age: {
    value: 8,
  },
});

console.log(child.name);
console.log(Object.getPrototypeOf(People) === Object.prototype); //true
console.log(Object.getPrototypeOf(child)); // { name: "people" }
console.log(child.hasOwnProperty("name")); // false
console.log(child.hasOwnProperty("age")); //true
```

若 `Object.create(null)` 则创建的对象没有原型

### Object.getOwnPropertyDesciptor(obj, property)

该方法可以详细的查看属性定义

```js
Object.getOwnPropertyDescriptor(Object.prototype, "toString");
// {writable: true, enumerable: false, configurable: true, value: ƒ toString()}
```

### Object.getOwnPropertyNames(obj)

返回一个数组,包含了当前对象所有的属性名称(字符串形式)

```js
Object.getOwnPropertyNames(Object.prototype);
// ["__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "constructor", "toLocaleString", "isPrototypeOf"]
Object.keys(Object.prototype);
// []
Object.getOwnPropertyNames(Object);
// ["length", "name", "arguments", "caller", "prototype", "assign", "getOwnPropertyDescriptor", "getOwnPropertyDescriptors", "getOwnPropertyNames", "getOwnPropertySymbols", "is", "preventExtensions", "seal", "create", "defineProperties", "defineProperty", "freeze", "getPrototypeOf", "setPrototypeOf", "isExtensible", "isFrozen", "isSealed", "keys", "entries", "values"]
Object.keys(Object);
// []
```

### Object.preventExtensions(obj)& Object.isExtensible(obj)

- `preventExtensions()`方法用于禁止向某一对象添加更多属性
- `isExtensible()`方法则用于检查某对象是否还可以被添加属性

### Object.seal(obj) & Object.isSeal(obj)

- `seal()`方法可以让一个对象密封，并返回被密封后的对象,
  - 与`preventExtensions()`基本相同
  - 它还会将现有属性 设置成不可配置

### Object.freeze(obj) & Object.isFrozen(obj)

- `freeze()`方法用于执行一切不受`seal()`方法限制的属性值变更
- `Object.freeze()` 方法可以冻结一个对象，冻结指的是不能向这个对象添加新的属性，不能修改其已有属性的值，不能删除已有属性，以及不能修改该对象已有属性的可枚举性、可配置性、可写性

```js
var deadline = Object.freeze({ date: "yesterday" });
deadline.date = "tomorrow";
deadline.excuse = "lame";
deadline.date; // 'yesterday'
deadline.excuse; // undefined
Object.isSealed(deadline); // true;
Object.isFrozen(deadline); // true
Object.getOwnPropertyDescriptor(deadline, "date");
// {value: "yesterday", writable: false, enumerable: true, configurable: false} (不可配置，不可写)
Object.keys(deadline); // ['date'] (可枚举)
```

### Object.keys(obj)

- 一种特殊的`for-in`循环,它只返回当前对象的属性,且这些属性必须是**可枚举的**
- 返回值是一个字符串数组

### Object.is(val1,val2) //往下 es6

- 该方法用来比较两个值是否严格相等。它与严格比较运算符 `===` 的行为基本一致
- 区别
  - `Object(+0,-0) //false`
  - `Object(NaN,NaN) //true`

```js
Object.is("qingsds", "qingsds"); // true
Object.is({}, {}); // false
Object.is(+0, -0); // false
+0 === -0; // true
Object.is(NaN, NaN); // true
NaN === NaN; // false
```

模拟 `Object.is`

```js
Object.defineProperty(Object, "is", {
  value: function (x, y) {
    if (x === y) {
      // 针对+0不等于-0的情况
      return x !== 0 || 1 / x === 1 / y;
    }
    // 针对 NaN的情况
    return x !== x && y !== y;
  },
  configurable: true,
  enumerable: false,
  writable: true,
});
```

### Object.assign(target,...sources)

该方法用来源对象 `source` 的所有可枚举的属性复制到目标对象`target` (只复制自身属性,不可枚举属性`enumerable = false`和继承属性不会被复制)

```js
var target = { a: 1 };
var source1 = { b: 2 };
var source2 = { c: 3 };
obj = Object.assign(target, source1, source2);
target; // {a:1,b:2,c:3}
obj; // {a:1,b:2,c:3}
target === obj; // true
// 如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。
var source3 = { a: 2, b: 3, c: 4 };
Object.assign(target, source3);
target; // {a:2,b:3,c:4}
```

```js
// 数组
Object.assign([1, 2, 3], [4, 5]);
// [4,5,3]

//嵌套对象
Object.assign({ a: { b: "c", d: "e" } }, { a: { b: "hello" } });
// {a: {b:'hello'}}
```

### Object.getOwnPropertySymbols(obj)

返回一个数组，该数组包含了指定对象自身的**非继承的**所有 `symbol` 属性键

### Object.setPrototypeOf(obj, prototype)

该方法设置一个指定的对象的原型

### Object.values(obj)( es8↓)

- `Object.values` 方法与 `Object.keys` 类似
- 返回所有可枚举属性值得数组

```js
var obj = { a: 1, b: 2, c: 3 };
Object.keys(obj); // ['a','b','c']
Object.values(obj); // [1,2,3]
```

### Object.entries(obj)

`Object.entries`方法返回一个给定对象自己的可枚举属性`[key，value]`对的数组

```js
var obj = { a: 1, b: 2, c: 3 };
Object.keys(obj); // ['a','b','c']
Object.values(obj); // [1,2,3]
Object.entries(obj); // [['a',1],['b',2],['c',3]]
```

### Object.fromEntries(iterable) es10

- `Object.fromEntries`方法返回一个给定可迭代对象（类似 Array、Map 或其他可迭代对象）对应属性的新对象
- `Object.fromEntries `是 `Object.entries`的逆操作

```js
let arr = [
  ["a", 1],
  ["b", 2],
  ["c", 3],
];
const arrObj = Object.fromEntries(arr);
console.log(arrObj); //{ a: 1, b: 2, c: 3 }
console.log(Object.entries(arrObj)); //[ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ]

let entries = new Map([
  ["name", "qingsds"],
  ["age", 16],
]);
console.log(Object.fromEntries(entries)); //{ name: 'qingsds', age: 16 }
```

## [参考资料]('https://lxchuan12.gitee.io/js-object-api/')
