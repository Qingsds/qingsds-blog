# 生命周期

## 声明周期图

![生命周期图](https://s2.loli.net/2022/01/13/fqzOjTHWSVxlv4M.png)

## 初始化

![生命周期-挂载](https://s2.loli.net/2022/01/13/5uhLbryomecQOHW.png)

## 更新

![生命周期-更新](https://s2.loli.net/2022/01/13/bDqr5sSioJw672v.png)

## 卸载

![生命周期-卸载](https://s2.loli.net/2022/01/13/EcaS5ufRrbGj3wy.png)

## getDerivedStateFromProps

> getDerivedStateFromProps 有且仅有一个用途:使用 props来派生/更新 state

- 废弃了 `componentWillMount`,新增了`getDerivedStateFromProps`
  - `getDerivedStateFromProps` 不是`componentWillMount` 的 替代品
  - `componentWillMount` 的存在不仅"鸡肋",而且危险,因此他并不值得被"代替",他应该被废弃.
- `getDerivedStateFromProps`在更新和挂载两个阶段都会"出镜"
- `getDerivedStateFromProps` 是一个静态方法(访问不到 this)
- 接收两个参数:props 和 state
- 需要有一个对象格式的返回值,react 需要用这个返回值来更新组件的 state
- `getDerivedStateFromProps` 方法对 state 的更新动作并非"覆盖"式更新,而是针对某个属性的定向更新

## getSnapshotBeforeUpdate

- `getSnapshotBeforeUpdate` 的返回值会作为第三个参数`componentDidUpdate` 它的执行时机是在 render 方法之后,真实 DOM 更新之前,通识获取到更新前的真实 DOM 和更新后的 state&props 信息
- `getSnapshotBeforeUpdate`想要发挥作用,离不开`componentDidUpdate`的配合

## React16 更新生命周期的原因

- Fiber 是 React16 对 React 核心算法的一次重写
- Fiber 会使原本同步渲染过程变成异步的
- React16之前,当触发一次组件的更新,React 都会构建一个新的虚拟 DOM 树,通过与上一次的虚拟 DOM 树Diff,进行定向更新,这个过程是一个递归的过程,同步渲染的递归调用栈是非常深的 只有最底层的调用返回了,整个渲染过程才会逐层返回,这个漫长且不可打断的过程有巨大风险,同步线程一旦开始,直到递归完成,才能结束,这个过程中浏览器什么都做不了,渲染时间稍长就会面临卡顿卡死的现象**(简单说,diff算法的递归操作导致过程漫长不可被打断,有卡顿或卡死的风险)**
- Fiber 架构的重要特征就是可以被打断的异步渲染模式,根据"能否被打断"这一标准,React 16 的声明周期被划分为了 render 和 commit 两个阶段
  - Render 阶段:纯净且没有副作用,可能被React暂停,终止或重新启动
  - Pre-commit 阶段:可以读取 DOM
  - Commit 阶段:可以使用 DOM 运行副作用,更新安排
  - render 阶段在执行过程中允许被打断,而 commit 阶段则总是同步执行的
- 根本原因:Fiber 机制下 render 阶段允许暂停,终止和重启
  - 这个导致 render 阶段的声明周期肯能会被**重复执行,**废弃的生命周期都在 render 阶段
  - 比如说，这件商品单价只要 10 块钱，用户也只点击了一次付款。但实际却可能因为 componentWillxxx 被打断 + 重启多次而多次调用付款接口，最终付了 50 块钱
- **让生命周期更存粹可控**

## 各个声明周期的常见使用场景

- constructor
  - 初始化 state ---比如截取路由中的参数进行赋值
  - 对类组件事件进行处理(绑定 this 防抖,节流)
  - 对类组件进行生命周期劫持,渲染劫持
- getDerivedStateFromProps
  - 组件初始化或更新时候,讲 props 映射到 state 中
  - 返回的值和 state 进行合并传入 `shouldComponentUpdate` 作为第二个参数用于判断是否渲染组件
- render
  - **createElement创建元素** , **cloneElement 克隆元素** ，**React.children 遍历 children**
- getSnapshotBeforeUpdate(获得更新前的快照)
  - 配合componentDidUpdate，保存一次更新前的信息
- componentDidUpdate(同步执行)
  - 获取最新 DOM 状态
  - 接受getSnapshotBeforeUpdate保存的快照信息
  - 避免设置 state ,可能会引起无限循环
- componentDidMount(同步执行)
  - 关于 DOM 的操作,比如事件监听
  - 初始化向服务器请求数据
- shouldComponentUpdate
  - 性能优化
- componentWillUnmount
  - 清楚延时器,定时器
