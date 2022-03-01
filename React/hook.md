# React-Hooks

## React-hooks 设计的动机

### Hooks 的优点

1. 告别难以理解的 class
   1. this
      1. 自定义组件中函数的 this 指向问题
   2. 声明周期
      1. 学习成本
      1. 不合理的逻辑规划方式,逻辑与生命周期耦合在一起
         1. 比如:设置订阅和卸载订阅两个关联的业务逻辑,只能被迫分布到不同的函数里
2. 解决业务逻辑难以拆分的问题
3. 使状态逻辑复用变得简单可行
4. 函数组件从设计思想上来看更加契合 React 的理念

### Hooks 的缺点

- Hooks 暂时还不能完全的为函数组件补齐类组件的能力
- 不能够很好的处理复杂逻辑
- Hooks 在使用层面有着严格的规则约束

## 16.8之前函数组件与类组件的对比

- 类组件需要继承 class,函数组件不需要
- 类组件可以访问生命周期方法,函数组件不能
- 类组件可以获取实例化后的 this,并基于这个 this 做各式各样的事情,而函数组件不能,
- 类组件中可以定义维护state(状态),而函数组件不行

## 类组件

- 封装:将一类属性和方法,"聚拢"到一个 clss 里去
- 继承:新的 clss 可以通过继承现有的 class 实现对某一类属性的复用
- 功能十分强大,但学习成本高
- 开发者编写的逻辑在封装后和组件黏在一起,这就使组件内部逻辑很难实现拆分和复用

## 函数组件

> _函数组件会捕获 render 内部的状态,这个两类组件最大的不同._

## Hooks 的使用原则

- 只在 React 函数中调用 Hook
- 不要再循环,条件或嵌套中调用 Hook
  - 确保再 Hooks 在每次调用时都会保持同样的执行顺序
- Hooks 的正常运作,在底层依赖于顺序链表

## useState

### useState 首次渲染的执行流程

![useState](https://s2.loli.net/2022/01/13/N2JorW3enQkX5xg.png)

### mountState 源码

```javascript
// 进入 mountState 逻辑
function mountState(initialState) {
  // 讲新的 hook 对象追加进链表的尾部
  var hook = mountWorkInProgressHook();

  // initialState 可以是一个回调,若是回调,则取回调执行后的值
  if (typeof initialState === "function") {
    // $FlowFixMe:Flow doesn't like mixed types
    initialState = initialState();
  }

  // 创建当前 hook 对象的更新队列,这一步主要是为了能够依序保留 dispatch
  const queue = (hook.queue = {
    last: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  });

  // 将 initialState 作为一个 "记忆值" 存下来
  hook.memoizedState = hook.baseState = initialState;

  /* 
  dispatch 是由上下文中叫 dispatchAction 的方法创建的,
  这里不必纠结这个方法具体做了什么
  */
  var dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber$1,
    queue
  ));

  // 返回目标数组. dispatch 其实就是范例中常常见到的 setXXX 这个函数.
  return [hook.memoizedState, dispatch];
}

//mountWorkInProgressHook
function mountWorkInProgressHook() {
  // 注意,这个 hook 是以对象的形式存在的
  var hook = {
    // hook 保存的数据
    memoizedState: null,
    // 本次更新以 baseState 为基础计算新的 state
    baseState: null,
    // 本次更新开始时已经有的 update 队列
    baseQueue: null,
    // 本次更新需要增加的 update 队列
    queue: null,
    // 指向下一个 hook
    next: null,
  };
  if (workInProgressHook === null) {
    /* 
    这行代码每个 React 版本不太一样,但做的都是同一件事:
    将 hook 作为链表的头节点处理
    */
    firstWorkInProgressHook = workInProgressHook = hook;
  } else {
    // 若链表不为空,则将 hook 追加到链表的尾部
    workInProgressHook = workInProgressHook.next = hook;
  }
  // 返回当前的 hook
  return workInProgressHook;
}
```

- hook 相关的所有信息都保存在一个 hook 对象里,hook 对象之间以单项链表的形式向后串联.

### useState 更新渲染时执行流程

![useState 更新渲染时执行流程](https://s2.loli.net/2022/01/13/jhp8xfPSKcEBCMZ.png)

- updateState
  - 按顺序去遍历之前构建好的链表取出对应的数据信息进行渲染

### 结论

`mountState`(首次渲染)构建链表并渲染,`updateState` 依次遍历链表并渲染
> _hooks 的渲染时通过 "此次遍历"来定位每个 hooks 内容的.如果前后两次读到的链表在顺序上出现差异,那么渲染的结果自然是不可控的._
> **Hooks的本质是链表**