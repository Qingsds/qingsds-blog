# setState

## setState 是同步的还是异步的?

### 测试代码

```javascript
import React from "react";
import "./App.css";

export default class App extends React.Component {
  state = {
    count: 0,
  };
  increment = () => {
    console.log("increment setState 前的 count", this.state.count);
    this.setState({
      count: this.state.count + 1,
    });
    console.log("increment setState 后的 count", this.state.count);
  };
  triple = () => {
    console.log("triple setState前的 count", this.state.count);
    this.setState({
      count: this.state.count + 1,
    });
    this.setState({
      count: this.state.count + 1,
    });
    this.setState({
      count: this.state.count + 1,
    });
    console.log("triple setState 后的 count", this.state.count);
  };
  reduce = () => {
    setTimeout(() => {
      console.log("reduce setState 前的 count", this.state.count);
      this.setState({
        count: this.state.count - 1,
      });
      console.log("reduce setState 后的count", this.state.count);
    }, 0);
  };

  render() {
    return (
      <div>
        <h2>{this.state.count}</h2>
        <button onClick={this.increment}>点我增加</button>
        <button onClick={this.triple}>点我增加三倍</button>
        <button onClick={this.reduce}>点我减少</button>
      </div>
    );
  }
}
```

- 展现内容

![image _6_.png](https://s2.loli.net/2022/01/13/qUdLDaNjYg86ftA.png)

- 输出结果

![控制台输出结果](https://s2.loli.net/2022/01/13/D8TENgGmvQtIcd5.png)

结果发现

- 前两个按钮是异步的,最后的按钮是同步执行的
- 由于批量更新的机制第二个按钮的三次 setState 只会针对最新的state 进行更新
- 批量更新流程如下

![截屏2022-01-11 14.59.34.png](https://s2.loli.net/2022/01/13/U6bFqEmDtBHxpu2.png)

### 首先 先看一下 setState 的工作流图

![setState 工作流程图.png](https://s2.loli.net/2022/01/13/gTvq3d4sCb2hroG.png)

### setState 入口函数(部分源码)

```javascript
/**
 * setState 入口函数
 * @param {*} partialState
 * @param {*} callback
 * 充当一个分发器的角色
 * 根据入参的不同,将其分发到不同的功能函数中去
 */
ReactComponent.prototype.setState = function (partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, "setState");
  }
};
```

这里的 setState充当了一个分发器的角色,将其分发到不同的功能函数中

- 对象 → `enqueueSetState`
- 函数 → `enqueueCallback`

#### 以对象形式的入参为例查看enqueueSetState

```javascript
/**
 * 以对象形式的入参为例
 * ps:由于需要单独拿出来,声明语法做了更改
 */
function enqueueSetState(publicInstance, partialState) {
  // 根据 this 拿到对应的组件实例
  var internalInstance = getInternalInstanceReadyForUpdate(
    publicInstance,
    "setState"
  );

  // 这个 queue 对应的就是一个组件实例的 state 数组
  var queue =
    internalInstance._pendingStateQueue ||
    (internalInstance._pendingStateQueue = []);
  queue.push(partialState);

  // enqueueUpdate 用来处理当前的组件实例
  enqueueUpdate(internalInstance);
}
```

- `enqueueSetState`做了两件事
  - 将新的 state 放进组件的状态队列里
  - 用`enqueueUpdate`来处理即将要更新的实例对象

### 查看enqueueUpdate 做了什么

```javascript
**
 * enqueueUpdate 源码
 */
function enqueueUpdate(component) {
  ensureInjected();
  // 注意 这一句是问题的关键,isBatchingUpdates 标识着当前是否出去批量创建/更新组件的阶段
  if (!batchingStrategy.isBatchingUpdates) {
    // 若当前没有处于批量创建/更新组件的阶段,则立即更新组件
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }
  // 否则,先把组件塞如 dirtyComponents 队列里,让它"再等等"
  dirtyComponents.push(component);
  if (component._updateBatchNumber == null) {
    component._updateBatchNumber = updateBatchNumber + 1;
  }
}
```

- 判断`batchingStrategy.isBatchingUpdates`的布尔值
  - 如果是 false 直接更新
  - 如果是 true 就放到 `dirtyComponents`等待


### ReactDefaultBatchingStrategy 源码

```javascript
/**
 * batchingStrategy
 * (可以认为是一个锁管理器)
 * 源码
 */
var ReactDefaultBatchingStrategy = {
  // 全局唯一的锁标识 🔐
  isBatchingUpdates: false,

  // 发起更新动作的方法
  batchedUpdates: function (callback, a, b, c, d, e) {
    
    // 缓存锁变量
    var alreadyBatchingStrategy =
      ReactDefaultBatchingStrategy.isBatchingUpdates;
    // "上锁"
    ReactDefaultBatchingStrategy.isBatchingUpdates = true;

    if (alreadyBatchingStrategy) {
      callback(a, b, c, d, e);
    } else {
      // 启动事务,将 callback放进事务里执行
      transaction.perform(callback, null.a, b, c, d, e);
    }
  },
};
```

`batchingStrategy`用于管理批量更新的对象
> 有一个全局唯一的锁标识 `isBatchingUpdates`用于保存当前是否处于批量更新过程

- `isBatchingUpdates`初始值为 false ,当执行更新动作时 改为 true
- 当`isBatchingUpdates`为 true任何组件都要暂停入队等待,且不能插队

`isBatchingUpdates` 是在同步代码中变化的

```javascript
/* 
  callback 执行完后RESET_BATCHED_UPDATES
  将isBatchingUpdates置为 false
*/
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function () {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  },
};
/* 
  FLUSH_BATCHED_UPDATES执行flushBatchedUpdates
  循环所有 dirtyComponents 调用updateComponent
  执行所有生命周期方法
*/
var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdate.flushBatchedUpdates.bind(ReactUpdates),
};
var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES,RESET_BATCHED_UPDATE]
```

### 结论

- `isBatchingUpdate`在同步代码中变化的 `setTimeout` 是异步执行 当 this.setState 执行调用发生时 `isBatchingUpdate`早已变为了 false.
- 在 React 钩子函数及合成事件中,它表现为异步
- 在setTimeout,setInerval等函数,包括 DOM 原生事件,都表现为同步