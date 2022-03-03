# fiber

## 前置知识

### React.element,fiber,dom 的关系

- `React.element`是由开发者用 `jsx` 语法写的元素结构,被构建成 `element` 对象的形式,上面保存了 `props`,`children` 等信息
- `DOM` 元素是浏览器上显示的元素
- 每一个类型的 `element` 都会有对应的 `fiber` 类型,`element` 发生变化引起的更新流程通过 `fiber` 调和改变,作用于元素,形成新的 `DOM` 做视图渲染

![](https://pic.qingsds.cn/0a90368f24f0477aaf0d446a8f6736db~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

element 于 fiber 之间的对应关系

```js
export const FunctionComponent = 0; // 对应函数组件
export const ClassComponent = 1; // 对应的类组件
export const IndeterminateComponent = 2; // 初始化的时候不知道是函数组件还是类组件
export const HostRoot = 3; // Root Fiber 可以理解为跟元素 ， 通过reactDom.render()产生的根元素
export const HostPortal = 4; // 对应  ReactDOM.createPortal 产生的 Portal
export const HostComponent = 5; // dom 元素 比如 <div>
export const HostText = 6; // 文本节点
export const Fragment = 7; // 对应 <React.Fragment>
export const Mode = 8; // 对应 <React.StrictMode>
export const ContextConsumer = 9; // 对应 <Context.Consumer>
export const ContextProvider = 10; // 对应 <Context.Provider>
export const ForwardRef = 11; // 对应 React.ForwardRef
export const Profiler = 12; // 对应 <Profiler/ >
export const SuspenseComponent = 13; // 对应 <Suspense>
export const MemoComponent = 14; // 对应 React.memo 返回的组件
```

### fiber 上保存的信息

```js
function FiberNode() {
  this.tag = tag; // fiber 标签 证明是什么类型fiber。
  this.key = key; // key调和子节点时候用到。
  this.type = null; // dom元素是对应的元素类型，比如div，组件指向组件对应的类或者函数。
  this.stateNode = null; // 指向对应的真实dom元素，类组件指向组件实例，可以被ref获取。

  this.return = null; // 指向父级fiber
  this.child = null; // 指向子级fiber
  this.sibling = null; // 指向兄弟fiber
  this.index = 0; // 索引

  this.ref = null; // ref指向，ref函数，或者ref对象。

  this.pendingProps = pendingProps; // 在一次更新中，代表element创建
  this.memoizedProps = null; // 记录上一次更新完毕后的props
  this.updateQueue = null; // 类组件存放setState更新队列，函数组件存放
  this.memoizedState = null; // 类组件保存state信息，函数组件保存hooks信息，dom元素为null
  this.dependencies = null; // context或是时间的依赖项

  this.mode = mode; //描述fiber树的模式，比如 ConcurrentMode 模式

  this.effectTag = NoEffect; // effect标签，用于收集effectList
  this.nextEffect = null; // 指向下一个effect

  this.firstEffect = null; // 第一个effect
  this.lastEffect = null; // 最后一个effect

  this.expirationTime = NoWork; // 通过不同过期时间，判断任务是否过期， 在v17版本用lane表示。

  this.alternate = null; //双缓存树，指向缓存的fiber。更新阶段，两颗树互相交替。
}
```

### fiber 之间如何建立关联

- return: 指向父级 Fiber 节点
- child: 指向子 Fiber 节点
- sibling: 指向兄弟 Fiber 节点

## Fiber 的更新机制

### 初始化阶段

#### 创建 `fiberRoot` 和 `rootFiber`

- `fiberRoot`: 首次构建应用时,创建一个 `fiberRoot` 作为整个 React 应用的根基
- `rootFiber`: 通过 `ReactDOM.render` 渲染出来的
  - 一个 React 应用可以有多 ReactDOM.`render` 创建的 `rootFiber` ，但是只能有一个 `fiberRoot`(应用根节点)
- 第一次挂载过程中,将 `fiberRoot` 和 `rootFiber` 建立关联

```js
function createFiberRoot(containerInfo, tag) {
  /* 创建一个root */
  const root = new FiberRootNode(containerInfo, tag);
  const rootFiber = createHostRootFiber(tag);
  root.current = rootFiber;
  return root;
}
```

![](https://pic.qingsds.cn/cb68640d39914c03bc77ea15616c7918~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

### 开始渲染阶段

> `workInProgress`:处于更新状态的 Fiber 树称为 `workInProgress` 树.当 `workInProgress` 上的状态是最新的状态，那么它将变成 `current` 树用于渲染视图。

> `current`: 正在视图层渲染的树叫 `current` 树

- 正式渲染阶段,会进入 `beginWork` 流程
- `rootFiber` 渲染流程
  - 复用当前 `current` 树的 `alternate` 作为 `workInProgress`
  - 若没有则会创建一个 `fiber` 作为 `workInProgress`,用 `alternate` 将创建的 `workInProgress` 和 `current` 关联(这个关联的过程只有初始化第一次创建 alternate 的时候进行)

```js
currentFiber.alternate = workInProgressFiber;
workInProgressFiber.alternate = currentFiber;
```

![](https://pic.qingsds.cn/9a7f5a9b77ff45febd8e255fcba1ba3a~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

### 调和子节点渲染视图

- 在新创建的 `alternates` 上完成 `fiber` 树的遍历包括 `fiber` 的创建
- 最后以 `workInProgress` 最为最新的渲染树,`fiberRoot` 的 `current` 指针指向 `workInProgress` 变成 `current Fiber` 树

![](https://pic.qingsds.cn/2022-03-0119.34.35.png?imgqsds)

![](https://pic.qingsds.cn/2022-03-0119.34.50.png?imgqsds)

### 更新

- 重新创建一颗 `workInProgress` 树.复用当前 `current` 树上的 `alternate` 作为新的 `workInProgress`
- 对于剩余的子节点,`React` 创建后和 `current` 树上的 `fiber` 建立 `alternate` 关联
- 渲染完毕后,`workInProgress` 再次变成 `current` 树

## 双缓冲树

> canvas 绘制动画时,如果上一帧计算量比较大,会导致清除上一帧画面到绘制当前画面之间的间隙过长,就会出现白屏,为了解决这个问题，canvas 在内存中绘制当前动画，绘制完毕后直接用当前帧替换上一帧画面,这种在内存中构建并直接替换的技术叫做**双缓存**

- React 用`workInProgress`(内存中构建的树)和 `current`(渲染树)实现双缓存逻辑
- 两棵树用 `alternate`指针相互指向,下次渲染时,直接复用缓存树(workInProgress)作为渲染树,上一次的渲染树(current)又作为缓存树,防止更新时状态的丢失,加快了 DOM 节点的替换和更新

## render 阶段

> 每个 `fiber` 都可以看做一个执行单元,在调和过程中,每个发生更新的 `fiber` 都会做一次 `workInProgress`, workLoop 是每一个执行单元的调度器,若渲染没有被中断,workLoop 会遍历一遍 fiber 树.

```js
function workLoop() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

- `performUnitOfWork`分为两个阶段:`beginWork`和`completeUnitOfWork`
  - `beginWork`: 向下调和的过程. 按照 `child` 指针逐层向下调和,期间会执行函数组件,实例类组件,diff 调和子节点,打不通的 `effectTag`
  - `completeUnitOfWork`: 向上归并的过程
    - 有兄弟节点,返回 sibling 兄弟
    - 没有返回 return 父级,一直返回到 fiberRoot
    - 期间形成 effectList,对于初始化流程会创建 DOM,对 DOM 元素进行事件收集,处理 style,className 等

```js
function performUnitOfWork() {
  next = beginWork(current, unitOfWork, renderExpirationTime);
  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }
}
```

### beginWork

- 根据不同的 tag 分别做处理
- 对于组件,执行部分声明周期,执行 render,得到最新的 children
- 向下遍历调和 children,复用 oldFiber 进行 diff 流程
- 打不用的副作用标签 effectTag

常用的 effectTag

```js
export const Placement = /*             */ 0b0000000000010; // 插入节点
export const Update = /*                */ 0b0000000000100; // 更新fiber
export const Deletion = /*              */ 0b0000000001000; // 删除fiebr
export const Snapshot = /*              */ 0b0000100000000; // 快照
export const Passive = /*               */ 0b0001000000000; // useEffect的副作用
export const Callback = /*              */ 0b0000000100000; // setState的 callback
export const Ref = /*                   */ 0b0000010000000; // ref
```

### completeUnitOfWork

- `completeUnitOfWork`会将 `effectTag` 的 `Fiber` 节点保存在一条 `effectList` 的单向链表中,在 `commit` 阶段,不需要遍历每一个 `fiber`,只需要执行更新 `effectList` 就行了
- `completeWork` 阶段处理 context;对元素标签初始化,创建真实 DOM,将子孙 DOM 节点插入刚刚生成的 DOM 节点中;触发 diffProperties 处理 props 如事件收集,style,className 的处理

## commit 阶段

- commit 阶段做的事情
  - 对一些生命周期和副作用钩子的处理,如 `componentDidMount`,函数组件中的 `useEffect`,`useLayoutEffect`
  - 在更新中增删改节点,还有一些细节的处理如 ref.
- commit 的三个阶段
  - `before mutation` 阶段(执行 DOM 操作前)
  - `mutation` 阶段(执行 DOM 操作)
  - `layout` 阶段(执行 DOM 操作后)

### before mutation

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    if ((effectTag & Snapshot) !== NoEffect) {
      const current = nextEffect.alternate;
      // 调用getSnapshotBeforeUpdates
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }
    if ((effectTag & Passive) !== NoEffect) {
      scheduleCallback(NormalPriority, () => {
        flushPassiveEffects();
        return null;
      });
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

- `before mutation` 还没有修改真实 DOM,是获取 DOM 快照的最佳时期,若是类组件有 `getSnapshotBeforeUpdate`,会执行这个声明周期
- 异步调用 `useEffect`,防止阻塞浏览器的渲染

### mutation

```js
function commitMutationEffects() {
  while (nextEffect !== null) {
    if (effectTag & Ref) {
      /* 置空Ref */
      const current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    switch (primaryEffectTag) {
      //  新增元素
      case Placement: {
      }
      //  更新元素
      case Update: {
      }
      //  删除元素
      case Deletion: {
      }
    }
  }
}
```

- 置空 ref
- 对真实 DOM 元素进行增删改操作

### layout

```js
function commitLayoutEffects(root) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    commitLayoutEffectOnFiber(
      root,
      current,
      nextEffect,
      committedExpirationTime
    );
    if (effectTag & Ref) {
      commitAttachRef(nextEffect);
    }
  }
}
```

- 对于类组件,会执行生命周期,`setState` 的 `callback`,对于函数组件执行 `useLayoutEffect` 钩子
- 如果有 ref,重新赋值 ref
