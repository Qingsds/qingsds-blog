# Promise

Promise 是异步编程的新的解决方案

## 旧异步编程

- fs 操作文件
- 数据库操作
- AJAX
- 定时器

## Promise 的优势

- 指定回调函数的方式更加灵活
  - 旧：必须在启动异步任务前启动
  - promise：启动异步任务 =》返回 promise 对象 =》给 promise 对象绑定回调函数(甚至可以在异步任务结束后指定/多个)
- 支持链式调用，可以解决回调地狱问题
  - 回调地狱就是回调函数的嵌套调用，不便于阅读不便于处理异常

## Promise 对象的状态(PromiseState)

实例对象中的一个属性

- pending 未决定的
- resolved /fulfilled 成功
- rejected 失败
- 说明
  - promise 对象的状态只能改变一次
  - 无论变为成功还是失败，都会有一个结果数据
  - 成果的结果一般称为 value，失败的结果一般称为 reason

## Promise 对象的值(PromiseResult)

实例对象中的另一个属性，保存这对象【成功/失败】的结果

- resolve
- reject

## Promise API

- Promise 构造函数：Promise(executor){}
  - executor 函数：执行器 （resolve，reject）=> {}
  - resolve 函数：内部定义成功时调用的函数 value=>{}
  - reject 函数：内部定义失败时调用的函数 reason =>{}

说明：executor 会在 Promise 内部立即同步调用，异步操作在执行其中执行

- Promise.prototype.then 方法: （onResolved，onRejected）=> {}
  - onResolved 函数：成功的回调函数
  - onRejected 函数：失败的回调函数

说明：指定用于得到成功 value 的成功回调函数和用于得到失败 reason 的失败回调返回一个新的 promise 对象

- Promise.prototype.catch 方法:（onRejected）=>{},是 then()的语法糖
- Promise.resolve() 快速返回一个成功的 Promise 对象

```javascript
let p1 = Promise.resolve(521);
/**
 * 如果传入的参数 非Promise类型对象，返回结果为成功的Promise对象
 * 如果传入的参数 为Promise类型的对象，则参数的结果决定了 resolve 的结果
 */
let p2 = Promise.resolve(
  new Promise((resolve, reject) => {
    resolve("ok");
  })
);
console.log(p1);
console.log(p2);
```

- Promise.reject() 快速返回一个失败的 Promise 对象

```javascript
/**
 * 传入任何参数都会返回失败的Promise对象
 * 如果传入的参数 为成功的Promise类型的对象，则失败的结果只为成功的Promise对象
 */
let p1 = Promise.reject(521);
let p2 = Promise.reject(
  new Promise((resolve, reject) => {
    resolve("ok");
  })
);
console.log(p1);
console.log(p2);
```

- Promise.add 方法：(promises) =>{}
  - promises: 包含 n 个 promise 的数组

说明：返回一个新的 promise，只有所有的 promise 都成功才成功，只要有一个失败了就直接失败

```javascript
let p1 = new Promise((resolve, reject) => {
  resolve("ok");
});
let p2 = new Promise((resolve, reject) => {
  resolve("ok");
});
let p3 = new Promise((resolve, reject) => {
  resolve("ok");
});
let p4 = new Promise((resolve, reject) => {
  resolve("nook");
});
const result = Promise.all([p1, p2, p3, p4]);
console.log(result);
/* 
全部成功的结果
Promise {<pending>}
[[Prototype]]: Promise
[[PromiseState]]: "fulfilled"
[[PromiseResult]]: Array(4)
0: "ok"
1: "ok"
2: "ok"
3: "nook"
length: 4
[[Prototype]]: Array(0)

数组中有一个失败的结果
Promise {<pending>}
[[Prototype]]: Promise
[[PromiseState]]: "rejected"
[[PromiseResult]]: "nook"
*/
```

- Promise.rece 方法：(promises) =>{}
  - promises: 包含 n 个 promise 的数组

说明：返回一个新的 promise，第一个完成的 promise 的结果状态就是最终的结果状态

## Promise 的关键问题

- **如何改变 promise 的状态？**
  - resolve(value)：如果当前是 pending 就会变成 resolved
  - reject(reason)：如果当前是 pending 就会变成 rejected
  - 抛出异常：如果当前是 pending 就会变成 rejected
    - throw err
- **一个 promise 指定多个成功/失败回调函数，都会调用吗？**
  - 当 promise 改变为对应状态时会都会被调用
- **改变 promise 状态和指定回调函数谁先谁后？**
  - 都有可能，正常情况下是指定回调再改变状态，但也可以先改变状态，再指定回调
  - 如果先改状态再指定回调？
    - 再执行器中直接调用 resolve()/reject()
    - 延迟更长时间才调用 then()
  - **什么时候才能得到数据？**
    - 如果先指定的回调，那当状态发生改变时，回调函数就会调用，得到数据
    - 如果先改变状态，那当指定回调时，回调函数就会调用，得到数据
- **promise.then()返回的新 promise 的结果状态由什么决定？**
  - 简单表达:由 then()指定的回调函数执行结果决定
  - 详细表达
    - 如果抛出异常，新 promise 变为 rejected，reason 为抛出的异常
    - 如果返回值是非 promise 的任意值，新 promise 改编为 resolved，value 为返回值
    - 如果返回的是另一个新 promise，此 promise 的结果就会成为新 promise 的结果
- **promise 如果串联多个操作任务？**
  - promise 的 then()返回一个新的 promise，可以开成 then()的链式调用
  - 通过 then 的链式调用串联多个同步/异步任务
- **promise 异常穿透**
  - 当使用 promise 的 then 链式调用时，可以再最后指定失败的回调
  - 前面任何操作出现了异常，都会传到最后失败的回调中处理
- **中断 promise 链**
  - 当使用 promise 的 then 链式调用时，在中间中断，不在调后面的回调函数
  - 办法：在调用函数中返回一个 pending 状态的 promise 函数

```javascript
let p = new Promise((resolve, reject) => {
  resolve("1");
});
p.then((value) => {
  console.log(value);
  // 返回一个pending 状态的promise来中断链条
  // 此段代码指挥输出1
  return new Promise(() => {});
})
  .then((value) => {
    console.log(222);
  })
  .then((value) => {
    console.log(333);
  })
  .catch((reason) => {
    console.warn(reason);
  });
```

### 微任务和宏任务

- 宏
  - script
  - setTimeout
  - setInterval
  - setImmediate
  - I/O 操作
  - UI 线程渲染
- 微
  - MutationObserver
    - DOM 变动观察器
  - Promise.then()/catch()
  - 基于 Promise 开发的其他任务(fetch)
  - V8 垃圾回收
  - process.nextTick(Node)

### Event Loop 执行顺序

- 开始执行
- 以整个脚本`script` 作为`第一个宏任务`执行
  - 同步代码直接执行
  - 其他(宏 微)任务进入相应队列
    - 微任务进入微任务队列
    - 宏任务进入宏任务队列
- 当前宏任务`script`执行完毕
  - 检查当前微任务执行队列，依次执行
- 根据队列 进入下一轮宏任务
  - 同步代码直接执行
  - 其他(宏 微)任务进入相应队列
    - 微任务进入微任务队列
    - 宏任务进入宏任务队列
  - 当前宏任务执行完毕
    - 检查当前的微任务队列依次执行

### Promise 与 setTimeout

```javascript
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
  }, 0);
});
const promise2 = promise1.then(() => {
  throw new Error("error");
});
console.log("promise1-1", promise1);
console.log("promise2-1", promise2);
setTimeout(() => {
  console.log("promise1-2", promise1);
  console.log("promise2-2", promise2);
}, 0);
```

- 判断执行的先后顺序
- 解析：
  - 先执行宏任务`script`
    - 遇到`promise1 = new Promise`先执行里边的内容
      - 带 resolve 的 setTimeout 加入 宏任务队列
    - 遇到 promise2 = promise1.then
      - promise2 状态还是`pending`，不处理
    - 输出 promise1，promise2
      - 两个 promise 都尚未处理 所以都是`pending`
    - 遇到第二个 setTimeout
      - 加入宏队列 此时宏队列中有 setTimeout1，setTimeout2
    - 执行宏任务 setTimeout1
      - 将 promise1 的状态改为 resolved
      - 执行 promise2
        - promise2 的状态改为 rejected
    - 执行宏任务 setTimeout2
      - 输出 promise1，promise2
        - `promise2-1 <resolve>:'success'`
        - `promise2-2 <reject>:Error:error!`

## async/await 和 Promise 的关系

- 执行 async 函数,返回的是一个 Promise 对象
- await 相当于 Promise 的 then
- try..catch 可捕获异常,代替了 Promise 的 catch

### async

- 执行 async 函数返回的是 Promise 的值
- async 的返回值
  - 如果是非 Promise 类型,则会包装为 resolve 状态 Promise 返回.
  - 如果为 Promise 类型,这会直接返回
  - 若没有返回值,则返回 resolve 状态的 Promise 值为 undefined

### await

- await 是同步代码
- 在 async function()里的 await 下面的代码被视为(微任务)
  - 可以当作 promise.then()
- 如果 await**后面**的**promise 没有返回值**
  - await 会一直等待 后面的代码不会执行
- 如果 await 后面的内容是 错误或者异常 终止错误结果 不会继续向下执行

```javascript
async function async1() {
  await async2();
  console.log("async1");
  return "async1 success";
}
async function async2() {
  return new Promise((resolve, reject) => {
    console.log("只会输出这一句");
    reject("结束运行 抛出这个错误");
  });
}
async1().then((res) => console.log(res));
```

### for...of

主要用于异步任务的循环
