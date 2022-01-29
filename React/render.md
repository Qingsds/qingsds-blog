
# ReactDOM.render

## ReactDOM.render 调用栈逻辑分层

![reactDOM.render 调用栈逻辑分层.png](https://s2.loli.net/2022/01/13/ZaST76r9dtVAsCF.png)

- `performSyncWorkOnRoot`开启的正式我们反复强调的 render
- `commitRoot` 正式开启渲染真实 DOM 渲染过程的 commit 阶段.

## 初始化阶段(源码)

```javascript
/**
 * ReactDOM.render代码函数体中以下面的方式调用了该函数
 */
render: function() {
  // ...
  return legacyRenderSubtreeIntoContainer(
    null,
    element,
    container,
    false,
    callback
  );
}

/**
 * 
 * @param {*} parentComponent 
 * @param {*} children 
 * @param {*} container 对应传入的真实 DOM 对象 
 * @param {*} forceHydrate 
 * @param {*} callback render 入参的回调
 * @returns 
 */
function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  forceHydrate,
  callback
) {
  // container 对应的事我们传入的真实 DOM 对象
  var root = container._reactRootContainer;
  // 初始化 fiberRoot 对象
  var fiberRoot;

  // DOM 对象本身不存在_reactRootContainer 属性,因此 root 为空
  if (!root) {
    // 若 root 为空,则初始化_reactRootContainer,并将其赋值给 root
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    );
    // legacyCreateRootFromDOMContainer
    // 创建出的对象会有一个_internalRoot 属性,将其赋值给 fiberRoot
    fiberRoot = root._internalRoot;

    // 这里处理的是 ReactDOM.render 入参中的回调函数
    if (typeof callback === "function") {
      var originalCallback = callback;

      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);
        originalCallback.call(instance);
      };
    } //initial mount should not be batched.

    // 进入 unbatchedUpdates方法
    unbatchedUpdates(function () {
      updateContainer(children, fiberRoot, parentComponent, callback);
    });
  } else {
    // else 逻辑处理的是非首次渲染的情况(即更新),其逻辑除了跳过了初始化工作
    // ,基本与楼上保持一致
    fiberRoot = root._internalRoot;
    if (typeof callback === "function") {
      var _originalCallback = callback;

      callback = function () {
        var instance = getPublicRootInstance(fiberRoot);
        _originalCallback.call(instance);
      };
    } //Update

    updateContainer(children, fiberRoot, parentComponent, callback);
  }
  return getPublicRootInstance(fiberRoot);
}

function unbatchedUpdates(fn, a) {
  // 这里是对上下文的处理,不必纠结
  var preExecutionContext = executionContext;
  executionContext &= ~BatchedContext;
  executionContext |= LegacyUnbatchedContext;

  try {
    // 重点在这里,直接调用了传入的回调函数 fn,对应当前链路中的
    return fn(a);
  } finally {
    // finally 逻辑里是对回调队列的处理,此处不用太关注
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      //  Flush the immediate callbacks that were scheduled during this batch
      resetRenderTimer();
      flushSyncCallbackQueue();
    }
  }
}

```

## 流程图

![render 流程](https://s2.loli.net/2022/01/13/8s9IAkEdSqxbFUh.png)

### 控制台输出 root 对象

![root](https://s2.loli.net/2022/01/13/yrpNPmskHzj4cCt.png)

### _internalRoot 对象上有一个 current 属性

![_internalRoot.current](https://s2.loli.net/2022/01/13/DGmr8kcqQ6ZxyBt.png)

- `current` 对象是一个 `FiberNode` 实例
  - `FiberNode`正式 `FIber` 节点对应的对象类型
- `FiberRoot`(`FiberRootNode` 实例)  -> `current` -> `rootFiber` 对象(`FiberNode`实例)
  - `FiberRoot`(`FiberRootNode` 实例)是真实 DOM 的容器节点
  - `rootFiber`是虚拟 DOM 的根节点

## updateContainer

```javascript
function updateContainer(element, container, parentComponent, callback) {
  // ...

  // 这是一个 event 相关的入参,此处不必关注
  var eventTime = requestEventTime();

  // ...

  // 这是一个比较关键的入参,lane 表示优先级
  var lane = requestUpdateLane(current$1);

  // 结合 lane(优先级) 信息,创建 update 对象,一个 update 对象意味着一个更新
  var update = createUpdate(eventTime, lane);

  // update的 payload 对应的是一个 React 元素
  update.payload = {
    element: element,
  };

  // 处理 callback
  // 这个 callback 其实就是我们调用 ReactDOM.render 时传入的 callback
  callback = callback === undefined ? null : callback;

  if (callback !== null) {
    if (typeof callback !== "function") {
      console.error(
        "render(...):Expected the last optional `callback` argument to be a" +
          "function. Instead receiver : %s.",
        callback
      );
    }
    update.callback = callback;
  }

  // 将 update 入队
  enqueueUpdate(current$1, update);
  // 调度 fiberRoot
  scheduleUpdateOnFiber(current$1, lane, eventTime);
  // 返回当前节点(fiberRoot)的优先级
  return lane;
}

```

### 主要做了三件事

- 请求当前 fiber 节点的 lane(优先级)
- 结合 lane创建 fiber 节点的 update 对象,并将其入队
- 调度当前节点(rootFiber)

### 这次渲染过程是同步的.为甚么是同步呢?

- react 提供了三种模式
  - legacy模式:`ReactDOM.render(<App/>,rootNode)`
  - blocking模式:`ReactDOM.createBlockingRoot(rootNode).render(<App/>)` 异步
  - concurrent 模式:`ReactDOM.createRoot(rootNode).render(<App/>)` 异步
- 想要开启异步 需要使用concurrent模式

### React 如何知道当前是哪个模式?

- react 会根据当前不同 mode 值 来判断是哪个模式

```javascript
/**
 * requestUpdateLane
 * 处理优先级的函数
 */
function requestUpdateLane(fiber) {
  // 获取 mode 属性
  var mode = fiber.mode;

  // 结合 mode 属性判断当前的调用方式
  if ((mode & BlockingMode) === NoMode) {
    return SyncLane;
  } else if ((mode & ConcurrentMode) === NoMode) {
    return getCurrentPriorityLevel() === ImmediatePriority$1
      ? SyncLane
      : SyncBatchedLane;
  }
  // ... 
  return lane;
}
```
