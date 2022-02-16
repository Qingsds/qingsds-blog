# JavaScript 类型转换

## JavaScript 的数据类型

- 基本数据类型
  - String
  - Number
  - Boolean
  - undefined
  - null
  - Symbol
  - BigInt (大于 253 - 1 的整数)
- 引用数据类型
  - Object 普通对象
  - Array 数组对象
  - Function 函数
  - RegExp 正则对象

## typeof 操作符

> `typeof`用来返回一个值得变量类型的字符串

- 对于基本类型 都会显示正确的类型(除了 null, null 显示 object 类型)
- 对于引用类型 除了函数 都显示 object
- 函数显示 function 类型

使用`typeof`判断 null 的方法是

```js
var a = null;
typeof a === "object" && !a; //true
```

## 什么是 JavaScript 是包装类型 ?

> 在 JavaScript 中, 基本类型是没有属性和方法的, 但是为了便于操作基本类型的值, 在调用基本类型的属性或方法时 JavaScript 会在后台隐式地将基本类型的值转换为对象

- 基本类型转包装类型
  - Object(基本类型)
- 包装类型转基本类型
  - 包装类型.valueOf()

看看下面的代码会输出什么?

```js
var a = new Boolean(false);
if (!a) {
  console.log("Okay!");
}
```

答案是什么都不会输出,虽然包裹的基本类型是 false,但 false 被包裹成包装类型后就成了一个对象,不是单纯的 false 值了

## toString 方法

- 特性
  - 所有数据类型(除了 null,undefined)外构造函数的原型对象上都会有 toString 方法
  - 基本数据类型的构造函数对象上的 toString 方法会覆盖 Object 原型上的方法
- 基本类型调用 toString 的原理流程
  - 将原始类型转化为字符串
  - 1.创建 Object 实例将值变为基本类型的包装对象
  - 2.调用实例方法 toString
  - 3.用后销毁
- 数字调用 toString 可能会被判断为小数点,导致调用报错,多加一个点可以避免

### 引用类型调用 toString

#### 数组

- 先转换
- 每一项转换为字符串后,再用","连接,空数组则返回空字符串
- join 函数可隐式转换字符串,参数是相连部分的值,如果同时重写了 toString 和 join,优先采用 toString

```js
let arr = [{ name: "string" }, 1];
console.log(arr.toString()); //[object Object],1
console.log([].toString()); //空字符串
console.log(arr.join("-")); //[object Object]-1
```

#### 普通对象

```js
var obj = { name: "string", age: 18 };
console.log(obj.toString()); //[object Object]
```

#### 其他

- 函数,正则 => 源代码字符串
- 日期 => 本地时区的日期字符串

```js
console.log(new Date().toString()); //Tue Feb 15 2022 15:42:36 GMT+0800 (中国标准时间)
```

### 为什么`Object.prototype.toString`可以判断值得类型?

在任何值上调用`Object.prototype.toString`方法,都会返回一个`[object NativeConstructorName]`格式的字符串. 在每个类内部都有一个`[[class]]`,这个属性就指定了上述字符串中的构造函数名

引用类型调用

```js
console.log(Object.prototype.toString.call({ name: "string" })); //[object Object]
console.log(Object.prototype.toString.call([1, 2, 3])); // [object Array]
console.log(Object.prototype.toString.call(function a() {})); //[object Function]
```

基本类型调用

```js
console.log(Object.prototype.toString.call("string")); //[object String]
console.log(Object.prototype.toString.call(1)); //[object Number]
console.log(Object.prototype.toString.call(true)); //[object Boolean]
console.log(Object.prototype.toString.call(null)); //[object Null]
console.log(Object.prototype.toString.call(undefined)); //[object Undefined]
```

## valueOf 方法

![截屏2022-02-15 21.16.47.png](https://s2.loli.net/2022/02/15/MRdkgvpVBr4O7sh.png)

- 把对象转换为一个基本类型的值
- 基本类型调用 返回本身
- 日期对象 返回时间戳

## 类型转换

JavaScript 的类型转换结果总是得到 string, number, boolean 类型中的一种

### string 和 number

- string 和 number 值进行互换
  - 分别使用 Number 函数和 String 函数
- number => string
  - String
  - toString
  - `+''`(隐式)
- string => number
  - Number
    - 传入非数字字符串就会返回结果 NaN
  - 元操作符+(隐式)
  - parseInt 函数(带字母也可以转)
    - parseInt 允许传入非数字字符,其从左向右解析,遇到非数字字符串就会停下
- null
  - null => string 'null'
  - null => number 0
- undefined
  - undefined => string 'undefined'
  - undefined => number NaN
- boolean
  - true => number 1
  - false => number 0

### 任意值转 boolean

- Boolean 函数显示类型转换
- !!符号

基本类型转 Boolean

- false
  - undefined
  - null
  - 0
  - NaN
  - ""
  - 空参
  - document.all

```js
var a = "10px";
console.log(parseInt(a)); //10
```

## 隐式类型转换

### ToPrimitive

JavaScript 中每个值隐含的自带方法,用来将值转换为基本类型,如果是基本类型,就返回对象本身,如果是对象,则如下处理

```js
/**
 * @obj 需要转换的对象
 * @type 期望的结果类型
 */
ToPrimitive(obj, type);
```

- type 为 number 或 string
  - number
    - 调用 obj 的 valueOf 方法,如果为原始值,则返回,否则下一步
    - 调用 obj 的 toString 方法,原始值则返回
    - 抛出 typeError 异常
  - string
    - 调用 obj 的 toString 方法,如果为原始值,则返回,否则下一步
    - 调用 obj 的 valueOf 方法,原始值则返回
    - 抛出 typeError 异常
- 默认情况下
  - 如果对象为 Date 对象,则 type 默认为 string
  - 其他情况,type 默认为 number

总结以上规则,转换类型的大概规则可以概括为一个函数

```js
var objToNumber = (value) => Number(value.valueOf().toString());
console.log(objToNumber([])); //0
console.log(objToNumber({})); //NaN
```

### 不同操作符下得隐式转换规则

- 1.+
  - 当+操作符两边至少有一个 string 类型变量时,两边都会隐式转换为字符串,其他情况,两边的变量都会转换成数字

```js
1 + "123"; // '1123';
1 + false; // 1
1 + Symbol(); // 报错
"1" + false; // 1false
false + true; //1
```

- 2.-,\*,/
  - 这三个操作符都会使两边转换为数字,NaN 也是数字

```js
1 * false; //0
1 * "12"; //12
1 / "aa"; //NaN
```

- 3.< 和 > 比较符
  - 如果两边都是字母,按照字母表排序
  - 其他情况转换为数字再比较

下面的代码输出什么?

```js
var a = { name: "string" };
var b = { age: 16 };
console.log(a + b);
```

输出: `[object Object] [object Object]`,运算过程如下:

```js
// ToPrimitive 的默认type为number 优先调用valueOf
a.valueOf(); // 结果返回对象本身,不是基本类型,继续下一步操作
a.toString(); //[object Object]
b.valueOf();
b.toString(); //[object Object];
//最后两个字符串相加,得出结果[object Object] [object Object]
```

## 对象转换基本类型

![截屏2022-02-15 16.28.03.png](https://s2.loli.net/2022/02/15/AaFXV3kcSrYziof.png)

## ==比较

### 类型相等

- 比较值

### 类型均为基本类型

- null 和 undefined
  - undefined 派生于 null
  - null == null
  - null == undefined
- string number
  - string 转换为 number
- boolean number
  - boolean 转换为 number
- string boolean
  - 都转换为 number

```js
console.log(null >= 0); //true
console.log(null == undefined); //true
console.log(null == null); //true
console.log(undefined == undefined); //true
```

### 引用类型

- 双方都是引用类型
  - 判断是否指向同一地址
- NaN
  - Object.is(NaN,NaN) true
  - 其他情况都是 false

```js
console.log(Object.is(NaN, NaN)); //true
console.log(NaN == NaN); //false
```

### 什么时候用 === 什么时候用 == ?

- 除了 null 的判断, 都用 === .

## null 和 undefined 的区别

- null
  - 表示 "无" 的对象
  - 转换为数字 0
  - 原型链的终点
- undefined
  - 表示 未定义
  - 转换为数字 NaN
  - 应用场景
    - 变量声明了,但没有赋值
    - 函数被调用时, 对应的参数没有提供
    - 函数没有返回值, 默认返回 undefined
