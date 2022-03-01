# CSS 布局

## 实现圣杯布局

```html
  <title>圣杯布局</title>
    <style>
      body {
        min-width: 550px;
      }
      #header {
        text-align: center;
        background-color: #f1f1f1;
      }
      /* 1.设置浮动 */
      #container .colum {
        float: left;
      }
      /* 3.根据左右两边的宽度设置父元素的padding */
      #container {
        padding-left: 200px;
        padding-right: 150px;
      }
      #center {
        background-color: #ccc;
        width: 100%;
      }
      /* 4.设置margin-left:100% 元素向上挤,与center重叠,然后向左移动200px */
      #left {
        position: relative;
        background-color: yellow;
        width: 200px;
        margin-left: -100%;
        right: 200px;
      }
      /* 5.设置margin-right:-150px 相当于没有宽度,向上浮动 */
      #right {
        background-color: red;
        width: 150px;
        margin-right: -150px;
      }
      /* 2.底部清除浮动 */
      #footer {
        clear: both;
        text-align: center;
        background-color: #f1f1f1;
      }
    </style>
  </head>
  <body>
    <header id="header">this is header</header>
    <div id="container">
      <div id="center" class="colum">this is center</div>
      <div id="left" class="colum">this is left</div>
      <div id="right" class="colum">this is right</div>
    </div>
    <footer id="footer">this is footer</footer>
  </body>
```

## 实现双飞翼布局

```html
    <title>双飞翼布局</title>
    <style>
      body {
        min-width: 550px;
      }
      .colum{
        float:left;
      }
      #center {
        background-color: #ccc;
        width: 100%;
        height: 200px;
      }
      #center-wrapper{
        margin: 0 190px;
      }
      #left {
        background-color: yellow;
        width: 190px;
        height: 200px;
        margin-left: -100%;
      }
      #right {
        background-color: red;
        width: 190px;
        height: 200px;
        margin-left: -190px;
      }
    </style>
  </head>
  <body>
      <div id="center" class="colum">
        <div id="center-wrapper">
          this is center
        </div>
      </div>
      <div id="left" class="colum">
        this is left
      </div>
      <div id="right" class="colum">
        this is right
      </div>
  </body>
```

### 手写 clearfix

```css
.clearfix:after {
  context: "";
  display: table;
  lear: both;
}
```

## flex 实现三点色子

### 前置知识

- flex-direction 主轴的方向
- justify-content 主轴对齐方式
- align-items 辅轴对齐方式
- flex-wrap 是否换行
- 子元素
  - align-self 子元素对齐方式

```css
.box {
  display: flex;
  justify-content: space-between;
}
.item {
  /* 背景颜色, 边框等 */
}
.item:nth-child(2) {
  align-self: center; /* 辅轴居中对齐*/
}
.item:nth-child(3) {
  align-self: flex-end; /* 辅轴底部对齐*/
}
```
