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
