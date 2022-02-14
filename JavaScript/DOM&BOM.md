# DOM BOM

## DOM

### DOM 事件流

#### 前置知识

- 事件流: 它描述的是事件在页面中传播的顺序
- 事件: 它描述的是事件在浏览器里发生的动作
- 事件的监听: 事件发生后, 浏览器如何响应 -> 用来应答事件的函数, 就是事件监听函数

#### 事件传播的三个阶段

1. 事件的捕获阶段
   - 在捕获阶段时从最外层的祖先元素, 向目标元素进行
   - 目的: 为了冒泡阶段实现计算好传播层次路径
2. 目标阶段
   - 当前元素的相关事件触发
3. 事件的冒泡阶段
   - 事件从目标元素向他的祖先元素传递，一次触发祖先元素上的事件(从内到外的顺序)

如果希望在捕获阶段触发事件，可以设置 addEventListener 的第三个参数

- 默认 false
- true 代表捕获阶段执行此方法
- false 代表冒泡阶段执行此方法

#### 阻止冒泡

- event.stopPropagation()

### event

- currentTarget
  - 记录了事件当下正在被哪个元素接收
- target
  - 指触发事件的具体目标,也就是具体的那个元素,是事件的真正来源
- preventDefault
  - 阻止默认行为
- stopPropagation
  - 不再派发事件

### 事件代理

- 将事件绑定到同一个祖先元素, 当后代元素上的事件触发时, 会一直冒泡到祖先元素,从而通过祖先元素的响应函数来处理事件
- 事件利用了冒泡 ,减少事件绑定次数, 提高程序性能
- 监听到事件后 通过 event.target 获得触发元素

![5ea6c2f20001815d11880874.jpeg](https://s2.loli.net/2022/02/09/K5LtT7BSoCn6Oey.png)

### window.onload 和 JQuery 的$(document).ready()的区别

- window.onload
  - 基于 DOM0 事件绑定
  - 必须等待所有资源加载完成后才会被触发执行
- $(document).ready()
  - DOM2 事件绑定
  - 只要 DOM 结构加载完成就会被触发执行

## BOM

### BOM 核心 API

- window
  - window 全局对象
- navigator
  - 当前浏览器信息, 可以识别浏览器
- location
  - 获取地址栏信息
- history
  - 浏览器历史记录, 可以操作浏览器向前翻页向后翻页

### 识别浏览器类型

- navigator.userAgent

```js
function myBrowser() {
  return navigator.userAgent; //获得浏览器字符串
}
console.log(myBrowser()); //Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36
```

### 防抖与节流

#### 节流函数

```js
function throttle(func, interval) {
  // last 为上次触发回调的时间
  let last = 0;
  // 将throttle 处理结果当做函数返回
  return function () {
    // 保留this
    let context = this;
    // 获取参数
    let args = arguments;
    // 记录本次回调触发的时间
    let now = +new Date();
    // 断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
    if (now - last >= interval) {
      func.apply(context, args);
      //如果时间间隔大于我们设定的时间间隔阈值,则执行回调
      last = now;
    }
  };
}
```

#### 防抖函数

```js
function debounce(func, time) {
  // 定时器
  let timer = null;
  return function () {
    // 保留this
    let context = this;
    // 保留调用时传入的参数
    let args = arguments;
    // 每次时间触发时,清除旧的定时器
    if (timer) {
      clearTimeout(timer);
    }
    // 建立新的定时器
    timer = setTimeout(function () {
      func.apply(context, args);
    }, time);
  };
}
```
