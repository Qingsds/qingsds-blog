# this 相关知识点

多数情况下,this 指向调用它所在**方法**的那个**对象**(谁调用的函数,this 就指向谁),所以 this 的指向是在调用时决定的

## 区分声明位置和调用位置

相对简单的例子

```js
var me = {
  stringName: "qingsds",
  hello: function () {
    console.log(`hello,I am ${this.stringName}`);
  },
};

var you = {
  stringName: "dou",
  hello: me.hello,
};

var stringName = "xiaopeng";
var hello = me.hello;

// 调用位置
me.hello(); //hello,I am qingsds
you.hello(); //hello,I am dou
hello(); //hello,I am xiaopeng
```

相对有难度的例子

```js
var me = {
  name: "qingsds",
  hello: function () {
    console.log(`hello, I am ${this.name}`);
  },
};

var you = {
  name: "xiaopeng",
  hello: function () {
    targetFunc = me.hello;
    // 此时方法被调用时没有任何对象前缀,所以默认指向window全局对象
    targetFunc();
  },
};

var name = "dou";
you.hello(); //hello, I am dou
```

## 特殊情况下的 this 指向

- 以下三种情况 this 百分百指向 window
  - 立即执行函数(IIFE)
  - setTimeout 中传入的函数
  - setInterval 中传入的函数

### 立即执行函数

```js var name = 'focus';
var me = {
  name: "qingsds",
  // 声明位置
  sayHello: function () {
    console.log(`hi, i am ${this.name}`);
  },
  hello: function () {
    (function (callback) {
      // 调用位置
      callback();
    })(this.sayHello);
  },
};

me.hello(); //hi, i am focus
```

其实原理还是一样 callback 被调用的时候,前面并没有任何对象前缀,默认指向 window

### setTimeout 和 setInterval 中传入的函数

```js
var name = "window";
var me = {
  name: "qingsds",
  hello: function () {
    setTimeout(function () {
      console.log(`hi, i am ${this.name}`);
    });
  },
};
me.hello(); //hi, i am window
```

setTimeout 和 setInterval,都是在全局作用域下实现的,无论是 setTimeout 还是 setInterval 里传入的参数,都会首先交付到全局对象上,因此 函数中 this 的指向是 window

## 严格模式下 this 的指向

### 普通函数中 this 在严格模式下的表现

普通函数:非"箭头函数"

```js
function showThis() {
  console.log(this);
}
showThis(); //输出window对象

("use strict");
function showThis() {
  console.log(this);
}
showThis(); //undefined
```

### 全局代码中的 this 在严格模式下的表现

```js
"use strict";
console.log(this); //window 对象
```

```js
"use strict";
var name = "window";
var me = {
  name: "qingsds",
  hello: function () {
    setTimeout(function () {
      console.log(`hi, i am ${this.name}`);
    });
  },
};
me.hello(); //hi, i am window
```

全局代码中的 this,不管是否处于严格模式,this 都是指向全局 window.

### 箭头函数

箭头函数中的 this 比较特别,它在"严格模式"和"非严格模式"下没有区别,和闭包很相似. 都是认"词法作用域",箭头函数中的 this,和如何调用它无关,由书写的位置决定.就是**定义该函数时所在的作用域指向的对象**,而不是使用时所在的作用域指向的对象。

例子:

```js
var name = "window";
var me = {
  name: "qingsds",
  // 声明的位置
  hello: () => {
    console.log(this.name);
  },
};
// 调用的位置
me.hello(); //window
```

为甚么是 window? **"该函数所在的作用域指向的对象"** ,作用域是指函数内部,这里的箭头函数,也就是 hello,所在的作用域是最外层的 JS 环境,因为没有其他函数包裹,然后最外层 JS 对象指向的对象是 window 对象,所以,这里的对象是 window 对象

使用箭头函数需要注意的其他几点:

- 不可以当做构造函数,也就是不能使用 new
- 不可以使用`arguments`对象，该对象在函数体内不存在,如果需要用 rest 代替
- 不可以使用`yield`命令,因此箭头函数不能用作`Generator`函数

## 改变 this 的指向

如何改变 this 的指向

- 通过改变书写代码的方式做到(比如箭头函数)
- 显示调用一些方法来改变(call,apply,bind)

### 改变代码的书写方式,进而改变 this 的指向

#### 箭头函数中的 this

例子:

```js
var a = 1;
var obj = {
  a: 2,
  // 声明位置
  showA: () => {
    console.log(this.a);
  },
};
// 调用位置
obj.showA(); // 1
```

箭头函数中的 this,在书写时就绑定在了它父及作用域的 this 上,无论如何调用的无法指向目标对象 --> 因为箭头函数的 this 是静态的

#### 构造函数里的 this

构造函数里的 this 会绑定到 new 出来的对象上

```js
function Person(name) {
  this.name = name;
  console.log(this);
}

let person = new Person("qingsds"); // Person {name: 'qingsds'}
```

### 显示的调用方法改变 this

call bind 和 apply 之间的区别

- 改变后直接函数调用
  - call
    - fn.call(target,arg1,arg2)
  - apply
    - fn.apply(target,[arg1,arg2])
- 仅作改变 不做执行
  - bind
    - fn.bind(target,args1,args2)

call , apply 和 bind 之间的区别较大,前者是改变 this 指向的同时执行函数,后者仅负责改变 this,不作任何执行操作

call 和 apply 主要的区别是入参,call 只需要将目标函数的入参逐个传入即可, apply 则希望入参以数组形式被传入.

#### 模拟 call 方法

```js
/**
 * 模拟call方法
 */
function getGlobalObject() {
  return this;
}

Function.prototype.myCall = function call(thisArg) {
  // this 不是函数,直接报错
  if (typeof this !== "function") {
    return new TypeError(`${this} is not a function`);
  }
  // 参数是null或者undefined,替换为全局对象
  if (thisArg === null || thisArg === undefined) {
    thisArgs = getGlobalObject();
  }
  let argsArray = [].slice.call(arguments, 1);
  // 将thisArg包装为对象
  thisArg = new Object(thisArg);
  let __fn = new Date().getTime();
  thisArg[__fn] = this;
  let result = thisArg[__fn](...argsArray);
  delete thisArg[__fn];
  return result;
};
```

#### 模拟 apply 方法

```js
function getGlobalObject() {
  return this;
}
Function.prototype.myApply = function apply(thisArg, argsArray) {
  // 判断this是否是函数类型
  if (typeof this !== "function") {
    return new TypeError(this + "is not a function");
  }
  // 参数是null或者undefined,替换为全局对象
  if (thisArg === null || thisArg === undefined) {
    thisArg = getGlobalObject();
  }
  // 判断argsArray是否为null或undefined
  if (argsArray === null || argsArray === undefined) {
    argsArray = [];
  }
  // 判断argsArray是否是数组或对象
  if (argsArray !== new Object(argsArray)) {
    return new TypeError(argsArray + "is not Array or object");
  }
  thisArg = new Object(thisArg);
  let __fn = new Date().getTime();
  thisArg[__fn] = this;
  let result = thisArg[__fn](...argsArray);
  delete thisArg[__fn];
  return result;
};
```

#### 模拟 bind 方法

```js
Function.prototype.myBind = function bind(thisArg) {
  if (typeof this !== "function") {
    return new TypeError(this + "is not a function");
  }
  //  缓存this
  const self = this;
  // 截取参数
  const bindArgs = Array.from(arguments).slice(1);
  // 定义要返回的bound函数
  const bound = function () {
    // 注意:返回的函数仍然能够接收参数
    const boundArgs = [...arguments];
    const finalArgs = bindArgs.concat(boundArgs);
    // 判断是否被new调用
    if (typeof new.target !== "undefined") {
      // 判断self是否是箭头函数,如果是箭头函数就没有prototype,没必要再做指向prototype的操作
      if (self.prototype) {
        bound.prototype = Object.create(self.prototype);
      }
      // 调用原函数 判断返回值
      const result = self.apply(this, finalArgs);
      const isFunc = typeof result === "function";
      const isObject = typeof result === "object" && result !== null;
      if (isFunc || isObject) {
        return result;
      }
      return this;
    } else {
      return self.apply(thisArg, finalArgs);
    }
    return bound;
  };
};
```
