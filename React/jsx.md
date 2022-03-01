# JSX

## JSX 的本质是什么,它和 JS 之间有什么关系?

- JSX 语法是如何在 JavaScript 中生效的 👉🏻 Babel
- JSX 会被编译为 React.createElement(),React.createElement()将返回一个叫做 "React Element"的 JS 对象.

## 什么是 Babel?

- Babel 是一个工具链,主要用于 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法,以便能够运行在当前和旧版本的浏览器或其他环境中 --_Babel_ _官网_
- 例子

```javascript
var name = "lidaming";
var place = "Beijing";

`Hello,${name},ready for ${place}?`;

//Babel 转换
"Hello,".concat(name, ",ready for").concat(place, "?");
```

## React 选用 JSX 语法的动机

- JSX 语法糖允许前端开发者使用我们最为熟悉的类 HTML 标签语法来创建虚拟 DOM,在降低学习成本时,也提升了研发效率与研发体验

## React 的创建元素方法

`createElement`的三个属性

- type
  - 用于标识节点的类型
- config
  - 以对象形式传入,组件所有的属性都会以键值对的形式存储在 config 对象中
- children
  - 以对象形式传入,他记录的事组件标签之间嵌套的内容
- 例子

```javascript

React.createElement("ul",{
//传入属性键值对
className:"list";
//从第三个参数开始往后,传入的参数都是 children
},React.createElement("li",{
key:"1"
},"1"),React.createElement("li",{
key:"2"
},"2"));

//DOM 结构
<ul className="list">
<li key="1">1</li>
<li key="2">2</li>
</ul>
```

## `createElement` --转换器 源码(带注释)

```javascript
/**
 * React 创建元素方法
 */
export function createElement(type, config, children) {
  // propName 变量用于储存后面需要的元素属性
  let propName;

  // props 变量用于储存元素属性的键值对集合
  const props = {};

  // key,ref,self,source 均为 React 元素的属性,此处不必深究
  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  // config 对象中存储的事元素的属性
  if (config != null) {
    // 进来之后做的第一件事,是依次对 ref key self和 source 属性赋值
    if (hasValidRef(config)) {
      ref = config.ref;
    }

    // 此处讲 key 值字符串化
    if (hasValidKey(config)) {
      key = "" + config.key;
    }
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // 接着就是要把 config 里面的属性都一个一个挪到 props 这个之前声明好的对象里面
    for (propName in config) {
      // 筛选出可以提进 props 对象里的属性
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }
  /* 
    childrenLength 指的是当前元素的子元素的个数,
    减去的 2 是 type 和config 两个参数占用的长度
  */
  const childrenLength = arguments.length - 2;

  // 如果抛去 type 和 config,就只剩下一个参数,一般意味着文本节点出现了
  if (childrenLength === 1) {
    // 直接把这个参数的值赋给 props.children
    props.children = children;
    // 处理嵌套多个子元素的情况
  } else if (childrenLength > 1) {
    // 声明一个子元素数组
    const childArray = Array(childrenLength);
    // 把子元素推进数组里
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    // 最后把这个数组赋值给 props.children
    props.children = childArray;
  }
  // 处理 defaultProps
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  // 最后返回一个调用 ReactElement 执行方法,并传入刚才处理过的参数
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
}
```

- 流程图

![ jsx 流程](https://s2.loli.net/2022/01/13/5OBxyw6Pc7QnIN8.png)

`createElement`的本质就是格式化数据

## `ReactElement` --组装 部分源码

```javascript
/**
 * ReactELement 源码
 */
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    // REACT_ELEMENT_TYPE是一个常量,用来标识该对象是一个 ReactElement
    $$typeof: REACT_ELEMENT_TYPE,
    // 内置属性赋值
    type: type,
    key: key,
    ref: ref,
    props: props,
    // 记录创造该元素的组件
    _owner: owner,
  };
  if (__DEV__) {
    // 这里是针对__DEV__环境下得处理,对理解主要逻辑意义不大, 略...
  }
  return element;
};
```

- `ReactElement`的作用主要是用于组装 reactElement 对象,并把它返回给 `createElement`,再由 `createElement` 返回给开发者手中

![image _1_.png](https://s2.loli.net/2022/01/13/HcjUpV8dgFqeKGy.png)
代码实例

```jsx
const AppJSX = (
  <div className="App">
    <h1 className="title">i am the title</h1>
    <p className="content">i am the content</p>
  </div>
);
console.log(AppJSX);
```

![image _2_.png](https://s2.loli.net/2022/01/13/8AwRdjFNmQOPGxo.png)

`ReactElement` 本质上是 JavaScript 对 DOM 的描述,也就是虚拟 DOM

- 而虚拟 DOM 和渲染到真实 DOM 之间的处理就是由 ReactDOM.render()来处理的

```jsx
ReactDOM.render(
  //需要渲染的元素(ReactElement)
  element,
  //元素挂载的目标容器(一个真实 DOM)
  container,
  //回调函数,可选参数,可以用来处理渲染结束后的逻辑
  [callback]
);
```

## JSX 的转换规则

| `jsx` 元素类型     | `react.createElement` 转换后                        | `type` 属性                  |
| ------------------ | --------------------------------------------------- | ---------------------------- |
| `element` 元素类型 | `react element`                                     | 标签字符串,如 `div`          |
| `fragment` 类型    | `react element`                                     | `symbol react.fragment` 类型 |
| 文本类型           | 直接字符串                                          | 无                           |
| 数组类型           | 返回数组结构;里面的元素被`react.createElement` 转换 | 无                           |
| 组件类型           | `react element`                                     | 组件类或者组件函数本身       |

> 在调和阶段,React element 对象的每一个子节点都会形成一个与之对应的 fiber 对象，然后通过 sibling、return、child 将每一个 fiber 对象联系起来。

### element 对象和 fiber 类型的对应关系

> React 针对不同 React element 对象会产生不同 tag (种类) 的fiber 对象

```js
export const FunctionComponent = 0;       // 函数组件
export const ClassComponent = 1;          // 类组件
export const IndeterminateComponent = 2;  // 初始化的时候不知道是函数组件还是类组件 
export const HostRoot = 3;                // Root Fiber 可以理解为根元素 ， 通过reactDom.render()产生的根元素
export const HostPortal = 4;              // 对应  ReactDOM.createPortal 产生的 Portal 
export const HostComponent = 5;           // dom 元素 比如 <div>
export const HostText = 6;                // 文本节点
export const Fragment = 7;                // 对应 <React.Fragment> 
export const Mode = 8;                    // 对应 <React.StrictMode>   
export const ContextConsumer = 9;         // 对应 <Context.Consumer>
export const ContextProvider = 10;        // 对应 <Context.Provider>
export const ForwardRef = 11;             // 对应 React.ForwardRef
export const Profiler = 12;               // 对应 <Profiler/ >
export const SuspenseComponent = 13;      // 对应 <Suspense>
export const MemoComponent = 14;          // 对应 React.memo 返回的组件
```

- fiber 节点之间的关系
  - child: 由父级 fiber 指向子级 fiber 的指针
  - return: 子级 fiber 指向父级 fiber 的指针
  - sibling: 一个 fiber 指向下一个兄弟 fiber 的指针

## 总结

![image _3_.png](https://s2.loli.net/2022/01/13/nWJHTuCIsZOBRcw.png)
