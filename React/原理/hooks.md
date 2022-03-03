# React Hooks 原理

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

## Hooks 的使用原则

- 只在 React 函数中调用 Hook
- 不要再循环,条件或嵌套中调用 Hook
  - 确保再 Hooks 在每次调用时都会保持同样的执行顺序
- Hooks 的正常运作,在底层依赖于顺序链表

## Hooks 与 fiber 之间的关系

> 数组件对应 fiber 用 `memoizedState` 保存 hooks 信息.

![](https://pic.qingsds.cn/Untitled-2022-03-02-1322.png?imgqsds)

> hooks 对象的三种处理策略

- `ContextOnlyDispatcher`
  - 防止在函数外部调用 hooks,调用了这个形态会抛出异常
- `HooksDispatcherOnMount`
  - 函数组件初始化 mount,初次建立 hooks 与 fiber 之间的关系
- `HooksDispatcherOnUpdate`
  - 函数组件的更新,组件更新时,需要 hooks 去获取更新维护状态

## useState

### useState 首次渲染的执行流程

![useState](https://s2.loli.net/2022/01/13/N2JorW3enQkX5xg.png)

### mountState 源码

```js
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
    //将 hook 作为链表的头节点处理
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

> _hooks 的渲染时通过 "此次遍历"来定位每个 hooks 内容的.如果前后两次读到的链表在顺序上出现差异,那么渲染的结果自然是不可控的._ > **Hooks 的本质是链表**

### 状态的派发

```js
const [number, setNumber] = React.useState(0);
```

```js
function mountState(initialState){
     const hook = mountWorkInProgressHook();
     // 如果 useState 第一个参数为函数，执行函数得到初始化state
    if (typeof initialState === 'function') {
      initialState = initialState()
       }
     hook.memoizedState = hook.baseState = initialState;
     // 负责记录更新的各种状态。
    const queue = (hook.queue = { ... });
    // dispatchAction 为更新调度的主要函数
    const dispatch = (queue.dispatch = (dispatchAction.bind(  null,currentlyRenderingFiber,queue, )))
    return [hook.memoizedState, dispatch];
}
```

- `state` 会被当前的 hook 的 `memoizedState` 保存
