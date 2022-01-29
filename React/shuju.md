
# 数据如何组件间的流动

React 的核心特征是数据驱动视图 `UI = render(data) 或 UI = fn(data)`

## 基于 props 的单项数据流

> 组件,从概念上类似于 JavaScript 函数,它接收任意参数(即"props")并返回用于描述页面展示内容的 React 元素 --props

## 单项数据流	

当前组件的 state 以 props 的形式流动时只能流向组件树种比自己层级更低的组件

- 父组件可以直接讲 this.props 传入子组件,实现父-子间的通信
- 子-父组件通信
  - 父组件传递给子组件的是一个绑定的自身上下文的函数,那么子组件在调用该函数时,就可以将想要交给父组件的数据以函数入参的形式给出去
- 兄弟组件通信

![单项数据流](https://s2.loli.net/2022/01/13/4UO6jf5cFIvdZEV.png)

- 不推荐层层传递,浪费很多代码,不易维护


## 利用"发布-订阅"模式驱动数据流

- on():负责注册事件的监听器,制定事件触发时的回调函数
- emit():负责触发事件 可以通过传参使其在触发的时候携带数据
- off():负责监听器的删除

**代码实例**

```javascript
class myEventEmitter {
  constructor() {
    // eventMap 用来储存事件和监听函数之间的关系
    this.eventMap = {};
  }

  // type 这里代表事件的名称
  on(type, handler) {
    // handler 必须是一个函数,如果不是直接报错
    if (!handler instanceof Function) {
      throw new TypeError("handler is not a function");
    }
    // 判断 type 事件对应的队列是否存在
    if (!this.eventMap[type]) {
      // 不存在,新建该队列
      this.eventMap[type] = [];
    }
    // 若存在,直接往队列里推入 handler
    this.eventMap[type].push(handler);
  }

  // 触发时可以携带数据,params 就是数据的载体
  emit(type, params) {
    // 假设改事件是有订阅的(对应的事件队列存在)
    if (this.eventMap[type]) {
      // 将事件队列里的 handler 依次执行出队
      this.eventMap[type].forEach((handler, index) => {
        // 别忘了读取 params
        handler(params);
      });
    }
  }

  off(type, handler) {
    if (this.eventMap[type]) {
      this.eventMap[type].forEach((item) => {
        if (item === handler) {
          this.eventMap[type].splice(i, 1);
        }
      });
    }
  }
}

```

**流程图**

![订阅流程图](https://s2.loli.net/2022/01/13/uxNkTyfSsGW8tI6.png)

## Context

### Context API 工作流程图

![context](https://s2.loli.net/2022/01/13/omhM9DFns5y8JCP.png)

### 基本语法

- 创建 
   - `React.createContext` 
- 提供者


```jsx
const xxxContext = React.createConetxt(null);
// 方式1
const xxxProvider = xxxContext.Provider;
// 方式2
<xxxContext.Provider value={?}>
</xxxContext.Provider>
```

- 消费者
  - 1-contextType-类组件
    - 组件上的静态属性 contextType 指向要获取的 context	

```jsx
const ThemeContext = React.createContext(null)
// 类组件 - contextType 方式
class ConsumerDemo extends React.Component{
   render(){
       const { color,background } = this.context
       return <div style={{ color,background } } >消费者</div> 
   }
}
ConsumerDemo.contextType = ThemeContext

const Son = ()=> <ConsumerDemo />
```

- 2-useContext-函数组件
  - useContext(想要获取的 context)


```jsx
const ThemeContext = React.createContext(null)
// 函数组件 - useContext方式
function ConsumerDemo(){
    const  contextValue = React.useContext(ThemeContext)
    const { color,background } = contextValue
    return <div style={{ color,background } } >消费者</div> 
}
const Son = ()=> <ConsumerDemo />
```

- 3-Consumer
  - xxxContext.Consumer + render props 的形式


```jsx
const ThemeConsumer = ThemeContext.Consumer // 订阅消费者

function ConsumerDemo(props){
    const { color,background } = props
    return <div style={{ color,background } } >消费者</div> 
}
const Son = () => (
    <ThemeConsumer>
       { /* 将 context 内容转化成 props  */ }
       { (contextValue)=> <ConsumerDemo  {...contextValue}  /> }
    </ThemeConsumer>
) 
```

### 其他 API

- displayName
  - 便于 React DevTools 来确定 context 显示的内容


```jsx
const MyContext = React.createContext(/*  */);
MyContext.displayName = 'MyDisplayName';

<MyContext.Provider> // 在 DevTools 中 "MyDisplayName.Provider" 
<MyContext.Consumer> // 在 DevTools 中 "MyDisplayName.Consumer" 
```

### 常见用法

- 动态 context
  - 使context 为可变的(比如使用 state 和 setState 进行变化和更新)

```jsx
import React, { useContext, useState } from "react";

const ThemeContext = React.createContext(null);

function ConsumerDemo() {
  const { color, background } = useContext(ThemeContext);
  return <div style={{ color, background }}>消费者</div>;
}
const Son = React.memo(() => <ConsumerDemo />);

function ProviderDemo() {
  const [contextValue, setContextValue] = useState({
    color: "#fff",
    background: "pink",
  });
  return (
    <div>
      <ThemeContext.Provider value={contextValue}>
        <Son />
      </ThemeContext.Provider>
      <button
        onClick={() => setContextValue({ color: "#fff", background: "blue" })}
      >
        切换主题
      </button>
    </div>
  );
}
```

## Redux

> _Redux 是 JavaScript 状态容器,它提供可预测的状态管理.

### Redux 的组成

- store是一个单一的数据源,而且是只读
- action 是对变化的描述
- reducer 负责对变化进行分发和处理


### 流程图

![redux 流程图](https://s2.loli.net/2022/01/13/4iPtz1dm2pk9FNn.png)

![redux 工作流程](https://s2.loli.net/2022/01/13/9EpXKiPBtSCWxQz.png)

### 在 Redux 的整个工作过程中,数据流是严格单向的