# 阮一峰 ES6 入门 读书笔记 📒


## let & const

### 暂时性死区(temporal dead zone)

> 只要块级作用域内存在 `let` 指令,它的变量就**绑定**在了这个区域,不受外界影响

如果区块内存在 `let const` 指令,在声明之前就使用声明的变量就会报错,在代码块内，使用`let & const`命令声明变量之前，该变量都是不可用的。

```js
var temp = "temp";
{
  temp = "b"; //ReferenceError: Cannot access 'temp' before initialization
  let temp;
}
```

需要注意的点:

```js
typeof x; //报错
let x;
```

注意 `typeof` 不要在变量声明之前使用

```js
function foo(x = y, y = 2) {
  //x = y 这里报错
  return [x, y];
}

//修改为下面代码不会报错
function foo(y = 2, x = y) {
  return [x, y];
}
```

> **总结**
>
> 暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量。

### 块级作用域和函数声明

```js
function f() {
  console.info("i am outside");
}

(function () {
  if (false) {
    // 重复声明一次函数
    function f() {
      console.info("i am inside");
    }
  }
  f();
})();
```

上面的代码在 ES5 中运行,会得到 `i am inside` 因为 if 内部声明的 f 函数会被提升到函数头部

```js
// ES5 环境
function f() {
  console.log("I am outside!");
}

(function () {
  function f() {
    console.log("I am inside!");
  }

  if (false) {
  }
  f();
})();
```

而在 ES6 环境 则会报错 `f is not a function`

为了浏览器的兼容性

- 允许在块级作用域内声明函数。
- 函数声明类似于 var，即会提升到全局作用域或函数作用域的头部。
- 同时，函数声明还会提升到所在的块级作用域的头部。

浏览器的 ES6 环境中，块级作用域内声明的函数,有类似于 var 的声明变量

```js
// 浏览器的 ES6 环境
function f() {
  console.log("I am outside!");
}

(function () {
  var f = undefined;
  if (false) {
    function f() {
      console.log("I am inside!");
    }
  }
  f();
})();
// Uncaught TypeError: f is not a function
```

### 顶层对象属性

```js
var a = 1;
window.a; //1

let b = 1;
window.b; //undefined
```

`let const class` 命令声明的全局变量,不属于顶层对象的属性

拿到全局对象的方法

```js
var getGlobal = function () {
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
};
```

## 变量的结构赋值

### 数组结构赋值

情况 1. 完全匹配

```js
let [foo, [[bar], baz]] = [1, [[2], 3]];
foo; // 1
bar; // 2
baz; // 3
```

情况 2. 解构不成功

```js
let [foo] = []; //foo:undefined
let [foo, bar] = [1]; //foo:1,bar:undefined
```

情况 3. 不完全解构,即等号左边的模式，只匹配一部分的等号右边的数组

```js
let [x, y] = [1, 2, 3];
//a: 1
//y: 2

let [a, [b], d] = [1, [2, 3], 4];
//a  1
//b  2
//d  4
```

情况 4. 等号右边不是数组(不可遍历的结构,不具备 `Iterator` 接口)

```js
// 报错
let [foo] = 1;
let [foo] = false;
let [foo] = NaN;
let [foo] = undefined;
let [foo] = null;
let [foo] = {};
```

只要数据具有 Iterator 接口,都可以采用数组形式的结构赋值

```js
function* fibs() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
//sixth : 5
```

#### 默认值

只有当一个数组成员严格等于 `undefined`,默认值才会生效

```js
const [x = 1] = [undefined];
// x:1
const [y = 1] = [null];
// x:null
```

如果默认值是表达式,那么这个表达式只有在用到的时候才会求值

```js
function f() {
  console.info("aaa");
}

let [x = f()] = [1]; //这种情况不会调用
```

默认值可以引用解构赋值的其他变量(前提是必须已经声明)

```js
let [x = 1, y = x] = []; //x:1 y:1
let [x = y, y = 1] = []; //报错 x 使用 y 时,y 还没有声明
```

### 对象结构赋值

> 对象的解构赋值和数组的区别
>
> - **数组**元素是依次排列,变量的取值由它的位置决定
> - **对象**的属性没有次序,变量必须与属性同名才能取到正确的值

对象解构失败,变量值为 undefined

如果变量名与属性名不一致,必须如下处理

```js
let { foo: baz } = { foo: "aaa", bar: "bbb" };
// baz: 'aaa'
```

实际上说明,对象的解构赋值是下面形式的简写

```js
let { foo: foo, bar: bar } = { foo: "aaa", bar: "bbb" };
```

> 内部机制: 先找到同名的属性 -> 在赋值给对应的变量 真正被赋值的事后者,而不是前者

```js
let { foo: baz } = { foo: "aaa", bar: "bbb" };
//baz  "aaa"
//foo  error: foo is not defined
```

#### 默认值

```js
var { x, y = 5 } = { x: 1 };
//x  1
//y  5
var { x: y = 3 } = {};
//y  3
var { x: y = 3 } = { x: 5 };
//y  5
```

生效条件也是属性值严格等于 `undefined`

#### 注意的点 📢

将已声明的变量用于结构赋值

```js
//错误写法
let x;
{
    x
}
= {x: 1}; //// SyntaxError: syntax error
// js引擎会把{x}理解成一个代码块,从而发生语法错误

// 正确写法 ✅
let x;
({x} = {x: 1})
```

数组的结构赋值

```js
let arr = [1, 2, 3];
let { 0: first, [arr.length - 1]: last } = arr;
//first  1
//last  3
```

### 字符串结构赋值

类数组对象都有 length 属性,因此可以对这个属性结构赋值

```js
let { length: len } = "hello";
//len 5
```

### 函数参数的结构赋值

```js
function add([x, y]) {
  return x + y;
}

add([1, 2]); // 3

// 默认赋值 1
function move({ x = 0, y = 0 } = {}) {
  return [x, y];
}

move({ x: 3, y: 8 }); // [3, 8]
move({ x: 3 }); // [3, 0]

//默认赋值 2
function move({ x, y } = { x: 0, y: 0 }) {
  return [x, y];
}

move({ x: 3, y: 8 }); // [3, 8]
move({ x: 3 }); // [3, undefined]
move({}); // [undefined, undefined]
move(); // [0, 0]
```

### 使用方式

遍历 Map

```js
const map = new Map();
map.set("first", "hello");
map.set("second", "world");

for (let [key, value] of map) {
  console.log(key + " is " + value);
}

//只获取键或值

// 获取键名
for (let [key] of map) {
  // ...
}

// 获取键值
for (let [, value] of map) {
  // ...
}
```

## 函数

- [**函数参数默认值**](#函数默认值)
  - 参数的默认值是惰性求值
  - 配合结构赋值可以设置双重默认值
  - 定义参数默认值应该是尾部参数(非尾部参数不能忽略)
  - 只有 undefined 可以触发默认值
  - [默认参数会导致函数的 `length` 失真(包括 rest 参数)](#函数的-length)
  - 一旦设置了默认值,函数参数会形成单独的作用域
- **rest 参数**
  - arguments 对象不是数组,是一个类数组对象
  - rest 参数是一个数组
  - rest 参数后面不能再有其他参数
  - 函数 length 属性不包括 rest 参数
- 严格模式
  - 只要函数参数使用了默认值、解构赋值、或者扩展运算符,就不能在函数内部显示设置严格模式
  - 解决
    - 使用全局的严格模式
    - 把函数包在一个无参数的立即执行函数里
- name 属性
  - 函数的 name 属性,返回该函数的函数名
- [**箭头函数**](#箭头函数)
  - 没有自己的 `this` 对象
    - this,arguments,super,new.target 都指向外层非箭头函数的函数
    - 不能用 bind apply call
  - 不可以当做构造函数,不能使用 `new`
  - 不能使用 `arguments` 可以使用 rest 参数
  - 不能使用 yield 命令
- 函数参数的尾逗号
  - 可以在尾部的参数加逗号
- `Function.prototype.toString()`
  - function 和函数名之前的空格注释 都会返回
- catch 命令的参数省略

### 函数默认值

参数默认值不是传值的,而是每一次重新计算默认值表达式的值,**_参数的默认值是惰性求值_** 看下面的代码演示 👁

```js
let x = 100;

function foo(num = x) {
  console.info(num);
}

foo(); // 100
x = 101;
foo(); //101
```

解构赋值可以和默认值结合使用

```js
function fetch(url, { method = "GET", header = {} }) {
  console.info(method);
}

fetch("123", {}); // GET
fetch("123"); //Cannot read properties of undefined (reading 'method')

// 改造 -> 双重默认值

function fetch1(url, { method = "GET", header = {} } = {}) {
  console.info(method);
}

fetch1("123", {}); // GET
fetch1("123"); //GET
```

`fetch1`中没有第二个参数时,函数参数的默认值就会生效,然后才是结构赋值的默认值生效

下面两种写法的区别

```js
function m1({ x = 1, y = 2 } = {}) {
  console.info(x, y);
}

function m2({ x, y } = { x: 1, y: 2 }) {
  console.info(x, y);
}

m1(); //1, 2
m2(); //1, 2

m1({ x: 1 }); //1, 2
m2({ x: 1 }); //1, undefined

m1({}); //1 ,2
m2({}); //undefined, undefined
```

- m1 是双重默认值
  - 若没有参数 默认{} => 默认解构赋值 {x = 1, y = 2}
- m2 把{ x : 1, y : 2} 作为 {x,y}的默认值
  - 只有在没有不填写参数时生效

参数默认值的位置

- 定义了默认值的参数应该是**尾部参数**
- 若是**非尾部的参数**设置了默认值,实际上这个参数无法省略

```js
function f(x = 1, y) {
    console.info(x, y);
}

f() //1, undefined
f(2) //2, undefined
f(, 1) //语法报错
f(undefined, 1) // 1, 1
f(null, 1) // null,1
```

注意 📢: 只有 `undefined` 可以触发默认值,`null` 无法触发默认值

#### 函数的 `length`

`length` 属性返回函数参数的个数, 函数参数指定了默认值以后, `length` 属性会失真

例子 🌰

```js
console.info(function (a) {}.length); // 1
console.info(function (a = 5) {}.length); // 0
console.info(function (a, b, c = 5) {}.length); // 2
```

`rest` 参数也不会计入 `length` 属性 ,如果设置了默认值的参数不是尾参数, 那么 `length` 属性也不会再计入后面的参数

```js
console.info(function (...args) {}.length); // 0
console.info(function (a = 0, b, c) {}.length); // 0
console.info(function (a, b = 1, c) {}.length); // 1
```

#### 作用域

一旦设置了默认值,函数进行声明初始化时,参数会形成一个单独的作用域,初始化结束,作用域消失(在不设置默认参数时,不会生效)

例子 🌰

```js
var x = 1;

function f(x, y = x) {
  console.info(y);
}

f(2); //2

// 参数的默认值是一个函数
let msg = "outer";

function foo(func = () => msg) {
  let msg = "inner";
  console.info(func());
}

foo(); //outer
```

```js
var x = 1;

function foo(
  x,
  y = function () {
    x = 3;
  }
) {
  x = 5;
  y();
  console.info(x);
}

foo(); // 3
console.info(x); //1
```

函数的参数形成了单独的作用域

- x => undefined
- x = 5
- y() 此时的 x 是参数中的 x
- x = 3

#### 应用

```js
function throwIfMissing() {
  throw new Error("missing parameter");
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo(); ///missing parameter
```

### name

函数的 name 属性,返回该函数的函数名

```js
console.info(function foo() {}.name); //foo

var f = function () {};
console.info(f.name); // f

console.info(new Function().name); //anonymous 匿名

console.info(function () {}.bind({}).name); //bound
```

### 箭头函数

=>

```js
function foo() {
  setTimeout(() => {
    console.info("args: " + [...arguments]);
  });
}

foo(1, 2, 3, 4); //args: 1,2,3,4
```

this,arguments,super,new.target 都指向外层非箭头函数的函数

### Function.prototype.toString()

```js
function /*foo comment */ foo() {}

console.info(foo.toString()); //function /*foo comment */ foo(){}
```

### catch 命令的参数省略

```js
try {
  throw new Error("catch");
} catch {
  console.info("catch error"); //catch error
}
```

## 数组

- 扩展运算符
  - `...` 将一个函数转为用逗号分隔的参数序列
  - 复制数组 `const arr2 = [...arr1]`
  - 合并数组 `const arr3 = [...arr1, ...arr2]`
    - 以上两个都是浅拷贝
  - 与解构赋值结合 `const arr = [1,2,3,[1,2,3]]; [a,...rest] = arr; // a = 1`
  - 字符串转数组
- [Array.from()](#arrayfrom)
  - 将类数组和可遍历对象(iterable 对象 set,map)转为数组
  - 第二个参数 类似于数组 map 的方法,加工元素并返回
  - 第三个参数 绑定 this
- Array.of()
  - 将一组值转换为数组
- copyWithin()
  - 将指定位置的成员复制到其他位置,会修改原数组
- find() & findIndex()
  - 找出符合条件的数组成员
  - 回调函数的三个参数
    - 当前值
    - 当前索引
    - 原数组
  - 第二个参数 可以绑定 this
  - 都可以发现 `NaN`
- fill()
  - 填充一个数组,若数组中已有元素,会被全部抹去
  - 第二个参数和第三个参数
    - 用于指定填充起始位置和结束位置
- entries(),keys() values()
  - keys 键名遍历
  - value 键值遍历
  - entries 键值遍历
- includes()
  - 可以判断 NaN
  - 第二个参数为搜索的起始位置,负数则表示倒数位置
- flat(),flatMap()
  - flat, 拍平,可以使用 `flat(Infinity)`代替递归拍平(不改变原数组)
  - flatMap 相当于执行 Array.prototype.map(),对返回值进行 flat (不改变原数组)
- at()
  - 接受一个整数作为参数，返回对应位置的成员，支持负索引

### Array.from

```js
let res = Array.from([1, 2, 3], (x) => x * x);
console.info(res); // 1, 4, 9

//等于
Array.from([1, 2, 3]).map((x) => x * x);
```

### find & findIdex

```js
[1, 3, 10, 14].find(function (value, index, arr) {
  return value > 9;
}); // 10

[1, 5, 10, 15].findIndex(function (value, index, arr) {
  return value > 9;
}); // 2

//绑定 this
function foo(val) {
  return val > this.age;
}

let person = { name: "jojo", age: 22 };
console.info([10, 2, 33].find(foo, person)); //33

//可以发现 NaN
console.info([NaN].findIndex((哈) => Object.is(NaN, 哈))); //0
```

### entries, keys & values

```js
for (let index of ["hello", "world"].keys()) {
  console.info(index);
}
// 0 1
for (let value of ["hello", "world"].values()) {
  console.info(value);
}
//hello world
for (let [index, value] of ["hello", "world"].entries()) {
  console.info(index, value);
}
// 0 hello 1 world
```

### includes

```js
//可以判断 NaN
[NaN].includes(NaN); //true
```

兼容方法

```js
const contains = (() =>
  Array.prototype.includes
    ? (arr, value) => arr.includes(value)
    : (arr, value) => arr.some((el) => le === value))();
```

### flat & flatMap

```js
const a = [1, [2, [3, [4, 5]]]];
console.info(a.flat(Infinity)); //[ 1, 2, 3, 4, 5 ]
```

### 数组的空位

数组的空位没有任何的值 比如 `Array()`构造函数返回的数组都是空位(空位不是`undefined`)

- `forEach`, `filter`, `reduce`, `every`, `some` 都会跳过空位
- `map` 会跳过空位,但会保留这个位置(空值)
- `join` 和 `toString` 会将空位视为 undefined
- `Array.from` ,`...`,`copyWithin`,`fill`, `entries`, `keys`, `values`, `find` 会将空位处理成 `undefined`

## 对象

### 属性简洁表达式

注意点 📢: 简写的对象方法不能用作构造函数,会报错

不 ok 🙅🏻‍♀️

```js
const obj = {
  f() {
    this.foo = "qingsds";
  },
};
new obj.f(); //TypeError: obj.f is not a constructor
```

ok

```js
const obj = {
  f: function () {
    this.foo = "qingsds";
  },
};

new obj.f();
```

### 属性名表达式

注意点 📢 : 属性名表达式如果是一个对象,会自动将对象转换为字符串

```js
const keyA = { a: 1 };
const keyB = { b: 2 };

const obj = {
  [keyA]: "valueA",
  [keyB]: "valueB",
};

console.info(obj); //{ '[object Object]': 'valueB' }
```

### name

对象的方法也是函数, 也有 name 属性

如果对象的方法使用了 getter 和 setter 方法在属性的描述对象的 get 和 set 上面

```js
const obj = {
  get foo() {},
  set foo(x) {},
};

const descriptor = Object.getOwnPropertyDescriptor(obj, "foo");

console.info(descriptor.get.name); //get foo
console.info(descriptor.set.name); //set foo
```

bind 创造的函数

```js
const func = function () {};

console.info(func.bind().name); //bound func
```

Symbol 返回这个 Symbol 的描述

```js
const keyOne = Symbol("description");
const keyTwo = Symbol();
const obj = {
  [keyOne]() {},
  [keyTwo]() {},
};
console.info(obj[keyOne].name); //[description]
console.info(obj[keyTwo].name); //""
```

### 属性的可枚举 和遍历

通过 `Object.getOwnPropertyDescriptor` 可以获得该属性的描述

- `writable` 是否可写
- `enumerable` 是否可以枚举
  - 若该属性为 false 某些操作会忽略当前属性
    - `for...in`循环,只遍历对象自身的和继承的可枚举的属性
    - `Object.keys`返回对象自身的所有可枚举的属性的键名
    - `JSON.stringify`
    - `Object.assign`
  - class 所有原型方法都不可枚举
- `configurable` 是否可修改配置

遍历对象属性的方法

- for in
  - 只遍历对象自身的和继承的可枚举的属性
- Object.keys
  - 返回对象自身的所有可枚举的属性的键名
- Object.getOwnPropertyNames(obj)
  - 返回一个数组,包含自身所有属性(不含 Symbol,但包括不可枚举属性)
- Object.getOwnPropertySymbols(obj)
  - 返回一个数组包含对象自身的所有 Symbol 属性的键名
- Reflect.ownKeys 返回一个数组 包含自身的所有键名(Symbol 和是否可枚举都返回)

```js
const obj = {
  [Symbol("des")]: 1,
  b: 2,
  c: 3,
};

console.info(Reflect.ownKeys(obj)); //[ 'b', 'c', Symbol(des) ]
```

### super

```js
const proto = {
  x: "hello",
  foo() {
    console.info(this.x);
  },
};

const obj = {
  x: "world",
  foo() {
    super.foo();
  },
};

Object.setPrototypeOf(obj, proto);
obj.foo(); //world
```

`super.foo` 等同于 `Object.getPrototypeOf(this).foo`

### Object.is

比较是否相等,和`===`的区别

```js
console.info(+0 === -0); //true
console.info(NaN === NaN); //false

console.info(Object.is(+0, -0)); //false
console.info(Object.is(NaN, NaN)); //true
```

ES5 通过下面代码部署 Object.is

```js
Object.defineProperty(Object, "is", {
  value: function (x, y) {
    if (x === y) {
      // 针对 +0 不等于 -0的情况
      return x !== 0 || 1 / x === 1 / y;
    }
    //针对 NaN 等于 NaN 的情况
    return x !== x && y !== y;
  },
  configurable: true,
  enumerable: false,
  writable: true,
});
```

### Object.assign

用于合并对象,将源对象(source) 所有可枚举属性,赋值到目标对象(target)

- 第一个参数是目标对象,后面的参数都是源对象
- 浅拷贝
- 如果目标对象与源对象有同名,或多个源对象有同名属性,则会后面的属性覆盖前面的
- 若参数只有一个
  - 是对象,直接返回该对象
  - 不是对象,转换成对象,然后返回
  - undefined 和 null 则会报错
- 只拷贝源对象的自身属性,不拷贝继承属性也不拷贝不可枚举的属性
- Symbol 值的属性会被拷贝

```js
const v1 = "abc";
const v2 = true;
const v3 = 10;
const obj = Object.assign({}, v1, v2, v3);
console.info(obj); //{ '0': 'a', '1': 'b', '2': 'c' }
```

`source` 是其他类型(不是 object) 除了字符串会议数组的形式,拷贝如目标对象,其它没效果,因为只有字符串的包装对象 会产生可枚举的属性

```js
console.info(Object(true)); //[[PrimitiveValue]]: true
console.info(Object(10)); //[[PrimitiveValue]]: 10
console.info(Object("qingsds"));
/*
0: "q"
1: "i"
2: "n"
3: "g"
4: "s"
5: "d"
6: "s"
length: 7
[[Prototype]]: String
[[PrimitiveValue]]: "qingsds"
*/
```

为属性指定默认值

```js
const defaultConfig = {
  logLevel: 0,
  outputFormat: "html",
};

function processContent(options) {
  options = Object.assign({}, defaultConfig, options);
  console.info(options);
}

processContent({ prot: 1001 }); //{ logLevel: 0, outputFormat: 'html', prot: 1001 }
```

### Object.getOwnPropertyDescriptors

返回指定对象所有自身属性(非继承)的描述对象

```js
const person = {
  name: "qingsds",
  age: 18,
  get name() {
    return this.name;
  },
  set name(val) {
    this.name = val;
  },
};
console.info(Object.getOwnPropertyDescriptors(person));
/* 
{
  name: {
    get: [Function: get name],
    set: [Function: set name],
    enumerable: true,
    configurable: true
  },
  age: { value: 18, writable: true, enumerable: true, configurable: true }
} */
```

该方法引入的目的

- 主要是为了解决 `Object.assign()` 无法正确拷贝 get 属性和 set 属性的问题

```js
const person = {
  name: "qingsds",
  age: 18,
  set foo(value) {
    console.info(value);
  },
};
const target = {};
Object.defineProperties(target, Object.getOwnPropertyDescriptors(person));
// Object.assign(target,person)
console.info(Object.getOwnPropertyDescriptors(target));

// 合并逻辑
const shallowMerge = (target, source) =>
  Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
```

上面 👆🏻 代码可以解决 set 和 get 的拷贝问题

`Object.getOwnPropertyDescriptors` 配合 Object.create 可以实现浅拷贝

```js
const shallowClone = (obj) => {
  return Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj)
  );
};
```

### Object.setPrototypeOf & Object.getPrototypeOf

`__proto__` 的实现

```js
Object.defineProperty(Object.prototype, "__proto__", {
  get() {
    let _thisObj = Object(this);
    return Object.getPrototypeOf(_thisObj);
  },
  set(proto) {
    if (this === undefined || this == null) {
      throw new TypeError();
    }
    if (!isObject(this)) {
      return undefined;
    }
    if (!isObject(proto)) {
      return undefined;
    }
    let status = Reflect.setPrototypeOf(this, proto);
    if (!status) {
      throw new TypeError();
    }
  },
});

function isObject(value) {
  return Object(value) === value;
}
```

#### Object.setPrototypeOf

用法

```js
Object.setPrototypeOf(object, prototype);
```

若第一个参数不是对象,自动转换为对象,并不会产生效果. undefined & null 作为第一个参数会报错

```js
console.info(Object.setPrototypeOf(1, {}) === 1); //true
console.info(Object.setPrototypeOf("qingsds", {}) === "qingsds"); //true
console.info(Object.setPrototypeOf(true, {}) === true); //true

console.info(Object.setPrototypeOf(undefined, {}));
console.info(Object.setPrototypeOf(null, {}));
//TypeError: Object.setPrototypeOf called on null or undefined
```

#### Object.getPrototypeOf

```js
// 等同于 Object.getPrototypeOf(Number(1))
Object.getPrototypeOf(1);
// Number {[[PrimitiveValue]]: 0}

// 等同于 Object.getPrototypeOf(String('qingsds'))
Object.getPrototypeOf("qingsds");
// String {length: 0, [[PrimitiveValue]]: ""}

// 等同于 Object.getPrototypeOf(Boolean(true))
Object.getPrototypeOf(true);
// Boolean {[[PrimitiveValue]]: false}

Object.getPrototypeOf(1) === Number.prototype; // true
Object.getPrototypeOf("qingsds") === String.prototype; // true
Object.getPrototypeOf(true) === Boolean.prototype; // true

Object.getPrototypeOf(null);
Object.getPrototypeOf(undefined);
// TypeError: Cannot convert undefined or null to object
```

### Object.keys Object.values Object.entries

```js
let { keys, values, entries } = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
  console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
  console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
  console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
```

先解构一下

const {keys,values,entries} = Object;

- keys 返回对象参数自身的不含继承的可遍历属性的键名 enumerable
- values 返回对象参数自身的不含继承的可遍历属性键值 enumerable
  - 返回数组的顺序是按照属性名数值的大小,从小到大返回
- entries 返回对象参数自身的不含继承的可遍历属性键值对数组
- Symbol 属性会被忽略

### Object.fromEntries

是 Object.entries 的逆操作,将一个键值对数组转换为对象

还可以配合 URLSearchParams 对象,将查询字符串转换为对象

```js
const o = Object.fromEntries(new URLSearchParams("name=qingsds&age=8"));
console.info(o); //{ name: 'qingsds', age: '8'
```

## Symbol

> 凡是属性名属于 Symbol 类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

- Symbol 不能与其他类型的值运算
- 可以显示转换为字符串,布尔值,但不能转换为数值

### 作为对象属性

```js
const func = Symbol("func");
const obj = {
  [func]: "hello",
};
console.info(obj[func]); //hello
console.info(obj.func); //undefined
```

不能用.调用,只能用方括号调用

### Symbol 作为属性名时的遍历

Symbol 作为属性名时,遍历对象的时候不会出现在如下循环中

- for...in, for...of
- Object.keys
- Object.getOwnPropertyNames
- JSON.stringify

可以在 Object.getOwnPropertySymbols 中获得,也可以在 Reflect.ownKeys 中获得(这个 api 可以获得自身所有的 key)

### 内置的 Symbol 方法

#### Symbol.hasInstance

> 指向一个内部方法。当其他对象使用`instanceof`运算符，判断是否为该对象的实例时，会调用这个方法

```js
class Even {
  static [Symbol.hasInstance](o) {
    return Number(o) % 2 === 0;
  }
}

console.info(10 instanceof Even); //true
console.info(123 instanceof Even); //false
```

#### Symbol.iterator

```js
const CustomIterable = {};
CustomIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 3;
  yield 5;
};
console.info([...CustomIterable]); //[ 1, 3, 5 ]
```

#### Symbol.toPrimitive

被调用时节后一个字符串参数,标识当前的运算模式

- number: 该场合需要转换成数值
- string: 该场合需要转换成字符串
- default: 可以转换成数值 也可以是字符串

```js
const obj = {
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number":
        return 123;
      case "string":
        return "hello";
      case "default":
        return "default";
      default:
        throw new Error();
    }
  },
};
console.info(1 * obj); //123
console.info(1 + obj); //1default
console.info(obj == "default"); //true
console.info(String(obj)); //string
```

## Set & Map 数据结构

### Set

> 类似于数组,每一个成员都是唯一的, 没有重复的值

Set 本身是一个构造函数,可以接收一个数组(或者具有 iterable 结构的其他数据结构) 用来初始化

api

- size 成员总数
- add 添加 返回 set 结构本身
- delete 删除某个值,返回布尔值
- has 返回布尔值
- clear 清除所有成员,没有返回值

遍历

- keys,values,entries,forEach (key 和 value)

WeakSet

只能加入对象类型的,weakSet 不能被遍历 没有 size 属性

### Map

遍历 Map 的方法 需要特别注意的是，Map 的遍历顺序就是插入顺序。

- Map.prototype.keys：返回键名的遍历器。
- Map.prototype.values：返回键值的遍历器。
- Map.prototype.entries：返回所有成员的遍历器。
- Map.prototype.forEach：遍历 Map 的所有成员。

```js
const map = new Map([
  ["F", "no"],
  ["T", "yes"],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"
```

#### Map 和其他数据类型的转换

Map 转 数组

```js
const myMap = new Map().set({ hello: "hello" }, 1).set({ world: "world" }, 3);
console.info([...myMap]);
//[ [ { hello: 'hello' }, 1 ], [ { world: 'world' }, 3 ] ]
```

Map 转 对象

如果所有的 Map 的键都是字符串,可以无损转为对象

```js
function stringMapToObject(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const map = new Map();
map.set("yes", true).set("no", false);
console.info(stringMapToObject(map));
//{ yes: true, no: false }
```

对象 转 Map

```js
let obj = { name: "qingsds", age: 19 };
let map = new Map(Object.entries(obj));
console.info(map); //Map(2) { 'name' => 'qingsds', 'age' => 19 }

// 自己实现
function objToMap(o) {
  let map = new Map();
  for (let key of Object.keys(o)) {
    map.set(key, o[key]);
  }
  return map;
}

console.info(objToMap({ name: "qingsds", age: 19 }));
//Map(2) { 'name' => 'qingsds', 'age' => 19 }
```

Map 转 JSON

Map 转为 JSON 要区分两种情况

- Map 的键名都是字符串,可以转为对象 JSON
- Map 的键名是非字符串,可以转为数组 JSON

```js
// 转对象 JSON
function strMapToJson(map) {
  return JSON.stringify(stringMapToObject(map));
}
```

```js
// 转数组 JSON
function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}
```

JSON 转 Map

所有键名都是字符串

```js
function jsonToStrMap(jsonStr) {
  return objToMap(JSON.parse(jsonStr));
}
```

JSON 是数组

```js
function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}
```

#### WeakMap

- WeakMap 只接受对象作为键名（null 除外），不接受其他类型的值作为键名
- WeakMap 的键名所指向的对象，不计入垃圾回收机制

用途 以 DOM 节点作为键名

```js
let myWeakMap = new WeakMap();
myWeakMap.set(document.getElementById("logo"), { timesClicked: 0 });
document.getElementById("logo").addEventListener(
  "click",
  function () {
    let logoData = myWeakMap.get(document.getElementById("logo"));
    logoData.timesClicked++;
  },
  false
);
```

`document.getElementById("logo")`是一个 DOM 节点,每次发生 click 事件,就会更新状态,一旦这个 DOM 节点删除,该状态就会自动消失,不存在泄漏风险

用途 部署私有属性

```js
const _counter = new WeakMap();
const _action = new WeakMap();

class Countdown {
  /**
   * constructor
   * @param {number} counter count
   * @param {() => viod} action 结束时的回调
   */
  constructor(counter, action) {
    _counter.set(this, counter);
    _action.set(this, action);
  }

  dec() {
    let counter = _counter.get(this);
    if (counter < 1) return;
    counter--;
    _counter.set(this, counter);
    if (counter === 0) {
      _action.get(this)();
    }
  }
}

const c = new Countdown(3, () => console.info("done"));

c.dec();
c.dec();
c.dec();
// done
```

## Proxy

> `Proxy` 用于修改某些操作的默认行为,属于一种"元编程",即对编程语言进行编程
>
> 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。

用法

```js
let proxy = new Proxy(target, handler);
```

`target`参数表示所要拦截的目标对象, `handler` 参数也是一个对象,定制拦截行为, 如果 handler 没有设置, 直接返回源对象

```js
var proxy = new Proxy(
  {},
  {
    get: function (target, propKey) {
      return 35;
    },
  }
);
console.info(proxy.name); //35
console.info(proxy.age); //35
console.info(proxy.phoneCall); //35
```

### Proxy 实例方法

get() 接收三个参数(目标对象,属性名,proxy 实例本身),最后一个参数可选

```js
const person = {
  name: "qingsds",
};
const proxy = new Proxy(person, {
  get: function (target, propKey) {
    if (propKey in target) {
      return target[propKey];
    } else {
      throw new ReferenceError(`Prop name ${propKey} does not exist`);
    }
  },
});
console.info(proxy.name); //qingsds
console.info(proxy.age); //Prop name age does not exist
//若不拦截,proxy.age 返回 undefined

//get 方法可以继承
const proto = new Proxy(
  {},
  {
    get(target, propKey) {
      console.info("get" + propKey);
      return target[propKey];
    },
  }
);
let obj = Object.create(proto);
console.info(obj.info); //getinfo undefined

//使用 get 实现数组读取负数的索引
function createArray(...elements) {
  const handler = {
    get(targe, propKey, receiver) {
      let index = Number(propKey);
      if (index < 0) {
        propKey = String(targe.length + index);
      }
      return Reflect.get(targe, propKey, receiver);
    },
  };
  const target = [];
  target.push(...elements);
  return new Proxy(target, handler);
}

const test = createArray("1", "2", "3", "4");
console.info(test[-1], test[-2]); //4 3

//若属性不可配置不可写, 则 Proxy 不能修改该属性,会报错
const target = Object.defineProperties(
  {},
  {
    foo: {
      value: 123,
      writable: false,
      configurable: false,
    },
  }
);

const handler = {
  get(target, propKey) {
    return "abc";
  },
};

const proxy = new Proxy(target, handler);

proxy.foo;
// TypeError: Invariant check failed
```

set()

拦截某个属性赋值操作,接收四个参数,目标对象,属性名,属性值和 Proxy 实例本身(最后参数可选)

例子 🌰

```js
//有时，我们会在对象上面设置内部属性，属性名的第一个字符使用下划线开头，表示这些属性不应该被
//外部使用 结合get和set方法，就可以做到防止这些内部属性被外部读写

/**
 *  检查命名是否合规
 * @param {string} key object key
 * @param {string} action action
 */
const invariant = (key, action) => {
  if (key[0] === "_") {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
};
const handler = {
  get(target, key) {
    invariant(key, "get");
    return target[key];
  },
  set(target, key, value) {
    invariant(key, "set");
    target[key] = value;
    return true;
  },
};
const target = {};
const proxy = new Proxy(target, handler);
console.info(proxy.__a); //Invalid attempt to get private "__a" property
console.info((proxy.__a = "a"));
```

set 代理应当返回一个布尔值,严格模式下,set 代理如果没有返回 true,就会报错

> apply()
>
> 拦截函数的调用,call 和 apply 的操作. 接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组

> has()
>
> 方法可以接受两个参数，分别是目标对象、需查询的属性名, 可以隐藏属性,不被 `in` 操作符发现

> construct()
>
> 方法用于拦截 new 命令，下面是拦截对象的写法

> deleteProperty()
>
> `deleteProperty` 方法用于拦截 `delete` 操作

> defineProperty()
>
> 拦截了 Object.defineProperty()操作

> getOwnPropertyDescriptor()
>
> 拦截 Object.getOwnPropertyDescriptor()，返回一个属性描述对象或者 undefined

> getPrototypeOf()
>
> 方法主要用来拦截获取对象原型(以下操作)

- Object.prototype.`__proto__`
- Object.prototype.isPrototypeOf()
- Object.getPrototypeOf()
- Reflect.getPrototypeOf()
- instanceof

> isExtensible()
>
> 方法拦截 Object.isExtensible()操作

> ownKeys()
>
> 拦截对象自身属性的读取操作。具体来说，拦截以下操作

- Object.getOwnPropertyNames()
- Object.getOwnPropertySymbols()
- Object.keys()
- for...in 循环

例子 拦截第一个字符为下划线的属性名

```js
let obj = {
  _foo: "foo",
  _bar: "bar",
  props: "func",
  name: "string",
};
let handler = {
  ownKeys(target) {
    return Reflect.ownKeys(target).filter((key) => key[0] !== "_");
  },
};

let proxy = new Proxy(obj, handler);
for (let key of Object.keys(proxy)) {
  console.info(obj[key]); //func ,,string
}
```

> Proxy.revocable()
>
> 方法返回一个可取消的 Proxy 实例

例子

```js
let target = {};
let handler = {};
let { proxy, revoke } = Proxy.revocable(target, handler);

proxy.foo = 123;
console.info(proxy.foo); //123

revoke();
console.info(proxy.foo); //Cannot perform 'get' on a proxy that has been revoked
```

### this 问题

虽然 Proxy 可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下，也无法保证与目标对象的行为一致。主要原因就是在 Proxy 代理的情况下，目标对象内部的 this 关键字会指向 `Proxy` 代理。

Proxy 拦截函数内部的 this，指向的是 handler 对象

```js
const handler = {
  get: function (target, key, receiver) {
    console.log(this === handler);
    return "Hello, " + key;
  },
  set: function (target, key, value) {
    console.log(this === handler);
    target[key] = value;
    return true;
  },
};

const proxy = new Proxy({}, handler);

proxy.foo;
// true
// Hello, foo

proxy.foo = 1;
// true
```

## Reflect

`Reflect` 对象的设计目的

- 将 Object 对象的一些明显属于语言内部的方法（比如 Object.defineProperty），放到 Reflect 对象上
- 修改某些 Object 的返回结果
  - 如 `Object.defineProperty(obj, name, desc)` 无法定义属性时,抛出错误
  - `Reflect.defineProperty(obj, name, desc)`则会返回 false
- 让 `Object` 操作都变成函数行为
  - 例子 🌰

```js
console.info("assign" in Object); //true
console.info(Reflect.has(Object, "assign")); //true
```

- Reflect 对象的方法与 Proxy 对象的方法一一对应. 只要是 Proxy 对象的方法,就能在 Reflect 对象上找到对应的方法
  - 例子 🌰

```js
// 每一个Proxy对象的拦截操作（get、delete、has），
//内部都调用对应的Reflect方法，保证原生行为能够正常执行。
const obj = {};
const logger = new Proxy(obj, {
  get(target, name) {
    console.info("get", target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.info("delete ", name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.info("has " + name);
    return Reflect.has(target, name);
  },
});

logger.name = "qingsds";
logger.age = 18;
console.info(logger.name); //get { name: 'qingsds', age: 18 } name
Reflect.deleteProperty(logger, "age"); //delete age
console.info("name" in logger); //has name
```

### Reflect 的静态方法

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

```js
class Person {
  constructor(name) {
    this.name = name;
  }
}

// construct
const qingsds = Reflect.construct(Person, ["qingsds"]);
console.info(qingsds); // Person { name: 'qingsds' }

// set
Reflect.set(qingsds, "age", 18);
console.info(qingsds.age); //18

// get
console.info(Reflect.get(qingsds, "name")); //qingsds
console.info(Reflect.get(qingsds, "phonecall")); //undefined

// delete
// delete qingsds.age
Reflect.deleteProperty(qingsds, "age");

// getPrototypeOf
console.info(Reflect.getPrototypeOf(qingsds) === Person.prototype); //true

// apply
// Reflect.apply 等于 Function.prototype.apply.call(func, thisArg, args)
function getName() {
  console.info(this.name);
}

Reflect.apply(getName, qingsds, []); //qingsds

// defineProperty
// Reflect.defineProperty 等于 Object.defineProperty
function MyDate() {}

Reflect.defineProperty(MyDate, "now", {
  value: () => Date.now(),
});
// 配合 Proxy.defineProperty
const p = new Proxy(
  {},
  {
    defineProperty(target, prop, descriptor) {
      console.info(descriptor);
      return Reflect.defineProperty(target, prop, descriptor);
    },
  }
);

// getOwnPropertyDescriptor
// Reflect.getOwnPropertyDescriptor基本等同于Object.getOwnPropertyDescriptor
const obj = Object.defineProperty({}, "hidden", {
  value: true,
  enumerable: false,
});
console.info(Reflect.getOwnPropertyDescriptor(obj, "hidden"));
/* {
  value: true,
  writable: false,
  enumerable: false,
  configurable: false
} */

// isExtensible
// 返回一个布尔值，表示当前对象是否可扩展。

// preventExtensions(target)
// 让一个对象变为不可拓展,返回个布尔值,表示是否操作成功

// ownKeys(target)
// 返回对象的所有属性
// 基本等同于Object.getOwnPropertyNames与Object.getOwnPropertySymbols之和。
```

### 使用 Proxy 实现观察者模式

> 观察者模式（Observer mode）指的是函数自动观察数据对象，一旦对象有变化，函数就会自动执行。

思路:observable 函数返回一个原始对象的 Proxy 代理,拦截赋值操作,触发充当观察者的各个函数

```js
const queueObservers = new Set();
const observe = (fn) => queueObservers.add(fn);
const observable = (obj) => new Proxy(obj, { set });

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queueObservers.forEach((observer) => observer());
  return result;
}

const person = observable({
  name: "qingsds",
  age: 18,
});

function print() {
  console.info(`${person.name}, ${person.age}`);
}

observe(print);
person.age = 20; //qingsds, 20
```

## Promise

所谓 Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果

### Promise 提供的方法

- Promise.all()
  - 用于多个 Promise 实例,包装成一个新的 Promise 实例
  - 数组中的成员状态都为`fulfilled`,结果状态为`fulfilled`
  - 只要有一个是 `reject`, 结果的状态为 `reject`,第一个 `reject`的成员作为返回值
  - 如果作为参数的 Promise 实例,自己定义了 catch 方法,就不会触发 Promise.all 的 catch 方法

例子 🌰

```js
const p1 = new Promise((res) => {
  res("hello");
});
const p2 = new Promise((res, rej) => {
  throw new Error("error");
})
  .then((res) => res)
  .catch((e) => e.message);

Promise.all([p1, p2])
  .then((res) => {
    console.info("then " + res); //then hello,error
  })
  .catch((e) => console.log(e));
```

- Promise.race()
  - 将多个 Promise 实例包装成一个新的 Promise 实例
  - 将成员中率先改变状态的 Promise 实例作为返回值

race 做超时处理

```js
/**
 *  超时处理
 * @param {() => Promise} fn 返回值是 Promise 的函数
 * @param {number} ms 超时时间
 */
function timeoutHandler(fn, ms) {
  const p1 = fn().then((data) => {
    return data;
  });
  const p2 = new Promise((res, rej) => {
    setTimeout(() => {
      res("任务已超时");
    }, ms);
  }).then((res) => {
    throw new Error(res);
  });

  return Promise.race([p1, p2]);
}

function test() {
  return new Promise((res) => {
    setTimeout(() => {
      res("任务成功");
    }, 3000);
  });
}

timeoutHandler(test, 3900)
  .then((res) => {
    console.info(res); //任务成功
  })
  .catch((err) => {
    console.info(err);
  });
```

- Promise.allSettled()
  - 用来确定一组异步操作是否都结束了（不管成功或失败）
  - 结果中的每个成员都有对应的 status 显示对应的状态,
    - 若是 fulfilled 则会有 value 属性
    - 若是 rejected 则会有 reason 属性

```js
const resolved = Promise.resolve(1);
const rejected = Promise.reject("err");

const allSettledPromise = Promise.allSettled([rejected, resolved]);
allSettledPromise.then((res) => {
  console.log(res);
});
/* 
[
  { status: 'rejected', reason: 'err' },
  { status: 'fulfilled', value: 1 }
]
*/
```

- Promise.any()
  - 接收一组 Promise 实例,返回最先成功的 Promise
  - 若没有成功的 Promise,
    - 不 catch 的情况下会抛出异
    - catch 情况下回返 `rejected`状态的 Promise 数组

```js
const resolved = new Promise((res) => {
  setTimeout(() => {
    res(1);
  });
});
const resolved1 = Promise.resolve(2);
const rejected = Promise.reject("err");
const alsoRejected = Promise.reject(Infinity);
Promise.any([resolved, rejected, alsoRejected, resolved1])
  .then((res) => {
    console.info(res); //2
  })
  .catch((e) => console.log(e));
Promise.any([rejected, alsoRejected])
  .then((res) => {
    console.info(res);
  })
  .catch((e) => console.info(e)); //[AggregateError: All promises were rejected]
```

- Promise.resolve()
  - 参数是一个 Promise 实例,不做任何改变 原封不动返回
  - 参数是 thenable 对象,在 then 方法执行后,立即执行最后的 then
  - 参数不是具有 then 方法的对象,或根本就不是对象
    - 若是原始值,用 包装成状态为 `resolved`

```js
const thenable = {
  then: function (res, rej) {
    res(22);
  },
};
const p1 = Promise.resolve(thenable);
p1.then((res) => {
  console.info(res); //22
});
```

- Promise.reject()

  - 会返回一个新的 Promise 实例，该实例的状态为`rejected`

- Promise.try()

```js
Promise.try(() => database.users.get({id: userId}))
    .then(...)
    .catch(...)
```

### Promise 实践

异步加载图片

```js
function loadImageAsync(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      reject(new Error("could not load img at " + url));
    };
    image.src = url;
  });
}
```

Ajax

```js
const getJSON = function (rul) {
  const promise = new Promise((resolve, reject) => {
    const handler = function () {
      if (this.readyState !== 4) return;
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };

    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    client.setRequestHeader("Accept", "application/json");
    client.send();
  });
  return promise;
};
```

实现 Promise.all

```js
Promise.all = function (promises = []) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(promises)) {
      reject("args must be array");
    }
    // 记录 resolved 的个数
    let resolvedNumbers = 0;
    const length = promises.length;
    const result = [];
    // 遍历 promises 数组
    promises.forEach((item, index) => {
      const actionItem = item;
      // 若元素不是 promise
      if (!actionItem.then) {
        actionItem = Promise.resolve(actionItem);
      }
      // 判断 promise
      actionItem
        .then((res) => {
          resolvedNumbers++;
          result[index] = res;
          if (resolvedNumbers === length) {
            resolve(result);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
};
```

## Iterator & for...of 循环

### Iterator

Iterator 遍历流程

- 创建一个指针对象,指向当前数据结构的起始位置
  - 遍历器本质上是一个指针对象
- 第一次调用指针对象的 `next` 方法,可以将指针对象指向数据结构的第一个成员
- 第二次调用指针对象的 `next` 方法,指向数据结构的第二个成员
- 不断调用 `next` 方法,直到指向数据结构的结束位置

模拟 Iterator 的 next

```js
/**
 * 模拟 next 返回值
 * @param {array} array
 */
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function () {
      return nextIndex < array.length
        ? { value: array[nextIndex++] }
        : { done: true };
    },
  };
}

const it = makeIterator(["a", "b", "c"]);
console.info(it.next()); //{ value: 'a' }
console.info(it.next()); //{ value: 'b' }
console.info(it.next()); //{ value: 'c' }
console.info(it.next()); //{ done: true }
```

**Iterator 接口**

> 默认的 Iterator 结构部署在数据结构的 `Symbol.iterator` 属性

- 此属性是当前数据结构默认的遍历器生成函数
- 执行此函数会返回一个遍历器
- 数据结构部署了 `Symbol.iterator` 属性,就成为部署了遍历器,调用这个结构,就会返回一个遍历器对象.
- 部署了 `Iterator` 可以被 `for...of` 循环调用
- 原生具备 Iterator 接口的数据结构
  - Array
  - Map
  - Set
  - TypedArray
  - 函数的 arguments 对象
  - NodeList 对象
- 使用场景
  - 解构赋值
  - 扩展运算符
  - yield\*
  -

例子

```js
// arguments
function hello() {
  let iterator = arguments[Symbol.iterator]();
  console.log(iterator.next()); //{ value: 1, done: false }
  console.log(iterator.next()); //{ value: 2, done: false }
  console.log(iterator.next()); //{ value: undefined, done: true }
}

hello(1, 2);

// string
var str = "hello";
var iterator = str[Symbol.iterator]();
for (let value of iterator) {
  console.log(value); // h e l l o
}

// yield* 后面跟一个可遍历的结构
var generator = function* () {
  yield 1;
  yield* [2, 3];
};
var iterator = generator();
console.info(iterator.next()); //{ value: 1, done: false }
console.info(iterator.next()); //{ value: 2, done: false }
console.info(iterator.next()); //{ value: 3, done: false }
console.info(iterator.next()); //{ value: undefined, done: true }

// 使用 Generator 实现 Iterator 接口
let myIterable = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  },
};
console.info([...myIterable]); //[1,2,3]
```

### for...of 循环

可以使用 `for...of` 遍历的类型

- 数组
- Set & Map
- DOM NodeList 对象,arguments,字符串
- for...in & for...of
  - for...in
  - 数组的键名是数字,但 for...in 循环是以字符串作为键名"0","1","2"等
  - for...in 会遍历原型链上的键
  - for...in 循环会以任意顺序遍历键名
  - for...in 循环主要是为遍历对象而设计的,不适合数组
  - for...of
  - 没有 for...in 以上的缺点
  - 可以配合 break,continue 和 return 使用
  - 提供了遍历所有数据的统一接口

## Generator 函数

- Generator 函数特征
  - `function` 关键字与函数名之间有一个星号`*`
  - 函数体内部使用 `yield` 表达式

```js
function* helloWorld() {
  yield "hello";
  yield "world";
  return "ending";
}

const hw = helloWorld();
console.info(hw.next()); //{ value: 'hello', done: false }
console.info(hw.next()); //{ value: 'world', done: false }
console.info(hw.next()); //{ value: 'ending', done: true }
console.info(hw.next()); //{ value: undefined, done: true }
```

- `Generator` 函数是分段执行的,`yield` 表达式是暂停执行的标记,`next` 方法可以恢复执行
- 第三次调用,函数从上次 `yield`表达式停下的地方,一直到 `return`,(若没 `return`,直接执行到函数结束,`value` 为 `undefined`) value 为 return 值,done 为
  true,标识遍历结束
- 调用 `Generator` 函数，返回一个遍历器对象,每次调用 `next` 方法,都会返回 `value` 和 `done` 两个属性值,
  - `value` => `yield` 表达式后面的表达式的值(yield 表达式后面的表达式是惰性求值)
  - `done` => 布尔值,表示遍历是否结束

### 注意事项

- `yield` 只能在 `Generator` 函数中使用
- `yield` 表达式如果在另一个表达式之中,必须放在圆括号里
- `yield` 表达式用作函数参数或放在赋值表达式右边,可以不加括号
- `next` 方法的参数表示上一个 `yield` 表达式的返回值, 所以在第一次用 next 方法时,传参数是无效的
- `Generator.prototype.throw()` 可以在函数体外抛出一个错误,然后在 `Generator` 函数体内捕获
  - 接收一个参数,该参数被 catch 语句接收,建议抛出 Error 对象实例
  - 如果`Generator`函数内部没有部署 try...catch 代码块,throw 使程序报错,中断执行
  - throw 被捕获后,会附带下一条 `yield` 表达式
- `Generator.prototype.return()` 可以返回给定的值,并且终结遍历 `Generator` 函数
  - 如果 Generator 内部有 `try...finally` 代码块,正在执行 `try` 代码块,那么 `return` 会导致立刻进入 `finally` 代码块,执行完后,整个函数才会结束
- next,throw,return 的作用都是让 Generator 函数恢复执行,并且使用不同的语句替换 yield 表达式

```js
// throw
function* gen() {
  try {
    yield 1;
  } catch (e) {
    console.info("内部捕获");
  }
  yield console.info("2");
}

var g = gen();
g.next();
g.throw();
//  内部捕获
//  2

//return
function* numbers() {
  yield 1;
  try {
    yield 2;
    yield 3;
  } finally {
    yield 4;
    yield 5;
  }
  yield 6;
}

let gen = numbers();
console.info(gen.next()); //{ value: 1, done: false }
console.info(gen.next()); //{ value: 2, done: false }
console.info(gen.return("xx")); //{ value: 4, done: false }
console.info(gen.next()); //{ value: 5, done: false }
console.info(gen.next()); //{ value: 'xx', done: true }
```

### yield\*

yield\* 可以遍历具有 Iterator 接口的数据结构和 Generator 函数的返回的对象

使用 yield\* 遍历完全二叉树

```js
class Tree {
  /**
   * constructor
   * @param {Tree} left
   * @param {Tree} label
   * @param {Tree} right
   */
  constructor(left, label, right) {
    this.left = left;
    this.label = label;
    this.right = right;
  }
}

// 中序遍历函数
// 函数体内采用递归算法，所以左树和右树要用yield*遍历
function* inOrder(t) {
  if (t) {
    yield* inOrder(t.left);
    yield t.label;
    yield* inOrder(t.right);
  }
}

// 生成二叉树
function make(array = []) {
  // 判断是否为叶节点
  if (array.length === 1) return new Tree(null, array[0], null);
  return new Tree(make(array[0]), array[1], make(array[2]));
}

let tree = make([[["a"], "b", ["c"]], "d", [["e"], "f", ["g"]]]);

// 遍历二叉树
let result = [];
for (let node of inOrder(tree)) {
  result.push(node);
}
console.info(result);
// ['a', 'b', 'c', 'd', 'e', 'f', 'g']
```

### Generator 使用

部署 Iterator 接口

```js
function* iterEntries(obj) {
  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    yield [key, obj[key]];
  }
}

let student = { name: "qingsds", age: 19 };
for (let [key, value] of iterEntries(student)) {
  console.log(key, value);
}
```

## class

私有属的提案,在属性名前面加上`#`表示

new.target 属性,返回 new 命令作用于的那个构造函数

```js
// 此函数只能通过 new 调用
function Person(name) {
  if (new.target === Person) {
    this.name = name;
    console.log(this.name);
  } else {
    throw new Error("必须使用 new 命令生成实例");
  }
}

// class
class Shape {
  constructor() {
    if (new.target === Shape) {
      console.log("Shape 模拟报错");
    }
  }
}

class Ins extends Shape {
  constructor() {
    super();
    console.log("正常调用");
  }
}
const b = new Ins(); //正常调用
const a = new Shape(); //Shape 模拟报错
```

### class 继承

`extends` 关键字,使用时,子类的 `constructor` 中必须要调用 `super()`,否则就会报错,因为子类自己的 this 对象 必须先通过父类的构造函数完成塑造,得到与父类同样的实例属性和方法,对其加工,若不调用 super,子类就得不到自己的 this 对象

除了私有属性,父类的所有属性和方法,都被子类继承(包括静态方法)

```js
class Person {
  #id = 1; //私有属性
  constructor(name, age) {
    console.log("父元素被调用");
    this.name = name;
    this.age = age;
  }
  static fine() {
    console.log("fine");
  }
  #getID() {
    //私有的方法
    console.log(this.#id);
  }
  hello() {
    console.log(`hello,i am ${this.name}`);
  }
}
class Student extends Person {
  constructor(name, age, number) {
    super(name, age);
    this.number = number;
  }
  test() {
    //   this.#getID 报错
  }
}
const student = new Student("qingsds", 19, 110); //父元素被调用
student.hello(); //hello,i am qingsds
Student.fine(); // fine
```

- 在子类普通方法中通过 `super` 调用父类方法时, 内部的 `this` 指向当前子类实例
- `super` 使用时,必须显式指定作为函数还是作为对象使用,否则报错

```js
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}

class N extends A {
  constructor() {
    super();
    this.x = 2;
    super.x = 3;
    console.log(super.x); //undefined
    console.log(this.x); //3
    console.log(super.valueOf()); // {x:3}
  }
  re() {
    super.print();
  }
}

const n = new N();
n.re(); //3
```

**类的 `prototype` 属性和`__proto__`属性**

- 子类的`__proto__`属性,表示构造函数继承,总指向父类
- 子类`prototype`属性的`__proto__`属性,表示方法的继承,总指向父类的`prototype`属性

```js
class Person {}
class Student extends Person {}
console.info(Student.__proto__ === Person); //true
console.info(Student.prototype.__proto__ === Person.prototype); //true
// 相当于
// student 的实例继承 person 的实例
Object.setPrototypeOf(Student.prototype, Person.prototype);
// Student 继承 Person 的静态属性
Object.setPrototypeOf(Student, Person);
```

这两条继承链可以这样理解

- 作为对象,子类(Student)的原型(`__proto__`属性) 是父类 (Person)
- 作为一个构造函数,子类的原型对象(`prototype`属性)是父类的原型对象(`prototype`属性)的实例

**原生构造函数的继承**

```js
class VersionedArray extends Array {
  constructor() {
    super();
    this.history = [[]];
  }
  /**
   * 提交当前的状态
   */
  commit() {
    this.history.push(Array.from(this));
  }
  /**
   * 回退到上一次提交的状态
   */
  revert() {
    // 拿到最后一次更新的下标
    const last = this.history.length - 1;
    // 删掉当前数组内的所有元素,用 history 的最后一个元素替换
    this.splice(0, this.length, ...this.history[last]);
  }
}

var x = new VersionedArray();

x.push(1);
x.push(2);
console.log(x); // [1, 2]
console.log(x.history); // [[]]

x.commit();
console.log(x.history); // [[], [1, 2]]

x.push(3);
console.log(x); // [1, 2, 3]
console.log(x.history); // [[], [1, 2]]

x.revert();
console.log(x); // [1, 2]
```

## Module

- ES6 模块的设计思想是尽量静态化,使得编译时就可以确定模块的依赖关系,以及输入和输出的变量
- CommonJS 和 AMD 模块,只能在运行时确认这些东西
