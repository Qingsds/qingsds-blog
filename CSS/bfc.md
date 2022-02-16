## BFC

> 块格式化上下文（Block Formatting Context，BFC） 是 Web 页面的可视化 CSS 渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

BFC 就是一个作用范围, 可以理解成一个独立的容器

### bfc 解决的布局问题

- 清除浮动
- 阻止 margin 发生重叠
- 阻止元素被浮动元素覆盖

### 常见的 bfc 方法

- float 的值 除了 none
- position 的值 除了 static 和 relative
- display
  - inline-block
  - inline-flex
  - table
  - flex
- overflow 的值 除了 visible
