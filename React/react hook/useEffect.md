# useEffect

`react 的三个部分`

- 调度器:调度更新
- 协调器:决定更新内容
- 渲染器:将更新的内容渲染到视图中

渲染器

- 渲染器会执行渲染视图的操作,操作真实 DOM

协调器

- 工作流程
  - 递 => 根节点向下一直到叶子节点
  - 归 => 叶子节点一路向上到根节点
- 决定更新内容
  - 它会为需要更新的 fiber 打上标记
  - 被打上标记的 fiber 会形成一条 effectList
  - **渲染器** 遍历 effectList 执行对应操作

`useEffect`工作流程

- 触发更新时,`FunctionComponent`被执行,执行到 `useEffect` 会判断第二个参数 deps 是否变化
- 如果 deps 变化,则 `useEffect`对应的`FunctionComponent`会打上`Passive` 的标记(需要执行 `useEffect`)
- 在渲染器中，遍历 `effectList` 过程中遍历到该 `fiber` 时，发现 `Passive` 标记，则依次执行该 `useEffect` 的 destroy（即 useEffect 回调函数的返回值函数）与 create（即 useEffect 回调函数）

`effectList`的构建时机

- 发生在递归的 归阶段，所以`effectList`的顺序也是从叶子节点一路向上

## [参考资料]("https://mp.weixin.qq.com/s/a25xf4AEwJXT7Ubvo6AL6g")
