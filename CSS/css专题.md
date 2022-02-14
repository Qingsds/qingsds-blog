# CSS

## 垂直/水平居中

### 绝对定位方案

#### margin 置为负值

前提: div 盒子宽高已知

```html
  <title>垂直居中</title>
    <style>
      #center {
        width: 200px;
        height: 200px;
        background-color: red;
        /* 处理居中的代码 */
        position: absolute;
        left: 50%;
        top: 50%;
        margin-top: -100px;
        margin-left: -100px;
      }
      html,
      body,
      #container {
        width: 100%;
        height: 100%;
        background-color: black;
      }
      #container {
        position: relative;
      }
    </style>
  </head>
  <body>
    <div id="container">
      <div id="center"></div>
    </div>
  </body>
```

#### margin auto

- 利用流体特性
- 触发: 当一个绝对定位元素,其对立定位方向属性同时有具体的数值的时候
- 特点: 元素可自动填充父级元素的可用尺寸

```css
#center {
  width: 200px;
  height: 200px;
  background-color: red;
  /* 处理居中的代码 */
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
```

#### 利用动画属性(transform)

```css
#center {
  width: 200px;
  height: 200px;
  background-color: red;
  /* 处理居中的代码 */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

translate 接收两个参数,元素沿着 x 轴和 y 轴的偏移量

### flex 布局

```css
#center {
  width: 200px;
  height: 200px;
  background-color: red;
}
html,
body,
#container {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 1px 问题

### 原因

1px 问题指的是: 在一些`Retina`屏幕 的机型上.移动端页面的 1px 会变得很粗,呈现出不止 1px 的效果.

原因: css 中的 1px 和 移动设备的 1px 的比例关系

> `window.devicePixelRatio = 设备的物理像素 / CSS像素`

### 解决方案

#### 直接写 0.5px

#### 伪元素先放大后缩小

思路:先放大 后缩小

- 目标元素的后面追加一个 ::after 伪元素
- 让这个元素布局为 absolute
- 然后把它的宽和高都设置为目标元素的两倍
- border 值设为 1px
- transform: scale(0.5)整个伪元素缩小为原来的 50%
- 此时, 伪元素的宽高刚好可以和原有的目标元素对齐. 而 border 也缩小为了 1px 的二分之一, 间接地实现了 0.5px 的效果

```css
#container[data-device="2"] {
  position: relative;
}

#container[data-device="2"]::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  content: "";
  transform: scale(0.5);
  transform-origin: left top;
  box-sizing: border-box;
  border: 1px solid #333;
}
```

#### viewport

```html
<meta
  name="viewport"
  content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no"
/>
```

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

## CSS 工程化

### css 工程化解决的问题

- 优化 css 文件结构, 实现复用
- 避免全局污染, 样式被覆盖
- 解决 css 代码冗余, 提高可维护性

### css 预处理器一般具有的特性(Sass, Less 等)

- 支持嵌套代码
- 支持自定义 css 变量
- 提供计算函数
- 允许对代码片段进行 extend 和 mixin
- 支持循环语句
- 支持 css 文件模块化, 实现复用

### PostCss

![5ee2df9e0001fdcf12580304.jpeg](https://s2.loli.net/2022/02/13/ZBAyn3VuUHkWevx.png)

PostCss 相当于 js 世界里的 babel, 它可以编译尚未被浏览器广泛支持的先进的 CSS 语法,支持各种各样的扩展, 极大的强化了 css 的能力

应用场景

- 提高 CSS 代码的可读性
- 提高 CSS 的兼容性

### webpack 如何处理 css

- Webpack 在裸奔的状态下, 是不能处理 CSS 的
- Webpack 在 loader 的辅助下,是可以处理 CSS 的
- css-loader 和 style-loader
  - 导入 CSS 模块,对 CSS 代码进行编译处理.
  - 创建 style 标签,把 CSS 内容写入标签.
- css-loader 的执行顺序一定要安排在 style-loader 的前面

## 响应式布局

### Viewport

viewport 视口 可以通过 meta 标签来控制它

```html
<meta name="viewport" content="width=device-width" />
```

- visual viewport
  - 通过`window.innerWidth`获取
  - 视觉视口,屏幕的实际尺寸
- layout viewport
  - 通过`document.documentElement.clientWidth`获取
  - 布局视口 指的是页面实际布局所占用的区域
  - 这里的`width=device-width`设置的就是**布局视口**的值刚好匹配上**视觉视口**

### rem 和 em

#### rem

> rem 指的是相对于 HTML 根元素的字体大小（font-size）来计算的长度单位

比如: 设置 html 的 font-size

```css
html {
  font-size: 100px;
}
```

那么换算关系

> 1rem = 100px;

```css
div {
  width: 1rem;
  height: 2rem;
}
```

等价于 div 的宽就是 100px,高就是 200px.

将 rem 设置为 10px

```css
html {
  /* rem em */
  /*em 相对于父元素的font-size*/
  /*rem 相对于根元素html的font-size, r就是root的意思*/
  /*16 * 62.5% = 10px*/
  /*1rem === 10px*/
  font-size: 62.5%;
}
```

#### em

> em 也是一个相对长度单位，它相对的是使用他们的元素的字体大小

例子

```css
div {
  font-size: 20px;
  padding: 10em;
  width: 20em;
}
```

其 padding 值为 200px,width 值为 400px.

易错点: em 是继承父元素的 font-size

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>em继承示例</title>
    <style>
      #dad {
        font-size: 20px;
      }
      #son {
        font-size: 16px;
        width: 10em;
        height: 20em;
      }
    </style>
  </head>
  <body>
    <div id="dad">
      我是爸爸
      <div id="son">我是儿子</div>
    </div>
  </body>
</html>
```

![截屏2022-02-13 16.37.07.png](https://s2.loli.net/2022/02/13/IsJAMK5BOXQZE8i.png)

所以 不管元素本身有没有显式地设置 font-size, em 取的都是当前元素的 font-size

### 响应式布局方案

#### rem 方案

```js
function refreshRem() {
  // 获取文档对象(根元素）
  const docEl = doc.documentElement;
  // 获取视图容器宽度
  const docWidth = docEl.getBoundingClientRect().width;
  // rem 取值为视图容器宽度的十分之一大小
  const rem = width / 10;
  // 设置 rem 大小
  docEl.style.fontSize = rem + "px";
}
// 监听浏览器窗口大小的变化
window.addEventListener("resize", refreshRem);
```

上这段代码节选自一个非常经典的轮子——flexible.js

将 rem 固定为视图容器宽度的十分之一. 之后不管视图宽度如何变化, 1rem 始终都是视图宽度的 1/10. 此时使用 rem 来进行布局，就可以实现等比缩放.

#### vw/vh

- vw: 1vw = 视觉视口宽度/100
- vh: 1vh = 视觉视口高度/100
