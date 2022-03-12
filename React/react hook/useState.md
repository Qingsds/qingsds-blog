# useState

## hook 如何保存状态?

- `functionComponent` 的 `render` 本身只是函数调用
- 每次 `functionComponent`在`render` 时,`currentlyRenderingFiber` 都会被赋值为该组件的对应 `fiber` 节点 `hook` 的内部是从 `currentlyRenderingFiber` 获取状态的
- **所以 `hook`内部其实是从 `currentlyRenderingFiber` 中获取信息状态**

> FunctionComponent 如何保存多个 hook,并获取对应的数据 ?

`currentlyRenderingFiber.memoizedState`中保存着一条 hook 对应数据的单向链表

例子

```js
function Index() {
  // hook1
  const [hook1, update1] = useState(0);
  // hook2
  const [hook2, update2] = useState(0);
  // hook3
  const ref = useRef(0);
}

// 转化为
const hook1 = {
  // hook 保存的数据
  memoizedState: null,
  // 指向下一个 hook
  next: hook2,
  // ....
};
hoo2.next = hook3;
currentlyRenderingFiber.memoizedState = hookA;
```

- 每执行到一个 `hook`,都会将指向 `currentlyRenderingFiber.memoizedState` 链表的指针向后移动一次,指向当前 hook 对应的数据

![](https://pic.qingsds.cn/20220312145502.png?imgqsds)

## useState 执行流程

useState 返回值的第二个参数为改变 state 的方法 ---- `dispatchAction`

- 每次调用`dispatchAction`都会创建一个`update`对象
- 多次调用,`update`会形成一条**环状链表**

```js
const hook = {
  // hook保存的数据
  memoizedState: null,
  // 指向下一个hook
  next: hookForB
  // 本次更新以baseState为基础计算新的state
  baseState: null,
  // 本次更新开始时已有的update队列
  baseQueue: null,
  // 本次更新需要增加的update队列
  queue: null,
};
```

- `queue` 中保存了本子更新 `update`的链表
- 计算 state 时
  - 将 queue 的环状链表剪开挂载到 baseQueue 后面
  - baseQueue 基于 baseState 计算新的 state
  - 计算完成后,新的 state 会成为 `memoizedState`

![](https://pic.qingsds.cn/20220312155243.png?imgqsds)

第二个参数 `dispatchAction`的实现

```js
update1 = dispatchAction.bind(null, currentlyRenderingFiber, queue);
```

### 当 `action` 为函数时

- `newState`基于`action`函数

```js
let newState = baseState;
let firstUpdate = hook.baseQueue.next;
let update = firstUpdate;

// 遍历baseQueue中的每一个update
do {
  if (typeof update.action === "function") {
    newState = update.action(newState);
  } else {
    newState = action;
  }
} while (update !== firstUpdate);
```

例子:

```js
const handleClick = () => {
  setNum(num + 1);
  setNum(num + 1);
  setNum(num + 1);
  setNum(num + 1);
};
return (
  <div className="app">
    <p>{num}</p>
    <button onClick={handleClick}>dianji</button>
  </div>
);
//点击之后最终结果为 1
```

当设置为函数时 最终结果为 4

```js
const handleClick = () => {
  setNum((n) => n + 1);
  setNum((n) => n + 1);
  setNum((n) => n + 1);
  setNum((n) => n + 1);
};
```

- 当传入的参数为 **_值_** 时,几次操作的 `action` 都为同一个值 最终计算的 `newState` 也为同一个值
- 当传入 **_函数_** 时,`newState` 基于 `action` 函数计算,最终得到累加的结果

## [参考资料](https://mp.weixin.qq.com/s/TKPcuU3vDlkeZ-LfdZZJJQ)