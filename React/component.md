# Component

## 组件与类和函数的区别

- 组件本质上就是类和函数,但与常规类和函数不同的是,**组件承载了渲染视图的 UI 和更新试图的 setState,useState 等方法.**

## React 对组件的处理流程

> 类组件

```js
function constructClassInstance(
  workInProgress, // 当前正在工作的 fiber 对象
  ctor, // 我们的类组件
  props // props
) {
  /* 实例化组件，得到组件实例 instance */
  const instance = new ctor(props, context);
}
```

> 函数组件

```js
function renderWithHooks(
  current, // 当前函数组件对应的 `fiber`， 初始化
  workInProgress, // 当前正在工作的 fiber 对象
  Component, // 我们函数组件
  props, // 函数组件第一个参数 props
  secondArg, // 函数组件其他参数
  nextRenderExpirationTime //下次渲染过期时间
) {
  /* 执行我们的函数组件，得到 return 返回的 React.element对象 */
  let children = Component(props, secondArg);
}
```

## 类组件

```js
function Component(props, context, updater) {
  this.props = props; //绑定props
  this.context = context; //绑定context
  this.refs = emptyObject; //绑定ref
  this.updater = updater || ReactNoopUpdateQueue; //上面所属的updater 对象
}
/* 绑定setState 方法 */
Component.prototype.setState = function (partialState, callback) {
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
/* 绑定forceUpdate 方法 */
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
```

这里可以看到 Component 的处理流程

- 类组件执行构造函数的过程中会绑定 props 和 context.
- 初始化 refs 为空对象.
- 原型链上绑定 setState 和 forceUpdate 方法.
  - setState 和 forceUpdate 方法实际上是调用了 updater 上的`enqueueSetState` 和 `enqueueForceUpdate`
- React 在实例化类组件之后会单独绑定 update 对象

## 类组件和函数组件的区别

- 类组件: 底层只需要实例化一次,实例保存了类组件 state 等状态,对于每次更新只需要调用 render 方法以及对应的声明周期就可以了
- 函数组件: 每一次更新都是一次新的函数执行,一次函数组件的更新,**里面的变量会重新声明.**
