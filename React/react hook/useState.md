# useState

## hook 如何保存状态?

 每次 `functionComponent` `render` 时,`currentlyRenderingFiber` 都会被赋值为该组件的对应 `fiber` 节点 `hook` 的内部是从 `currentlyRenderingFiber` 获取状态的


