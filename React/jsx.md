# JSX

## JSX 的本质是什么,它和JS 之间有什么关系?

- JSX 语法是如何在 JavaScript 中生效的 👉🏻 Babel
- JSX 会被编译为 React.createElement(),React.createElement()将返回一个叫做 "React Element"的 JS 对象.

## 什么是 Babel?

- Babel 是一个工具链,主要用于 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法,以便能够运行在当前和旧版本的浏览器或其他环境中 --_Babel_ _官网_
- 🌰例子

```javascript
var name = "lidaming";
var place = "Beijing"; 

`Hello,${name},ready for ${place}?`;

//Babel 转换
"Hello,".concat(name,",ready for").concat(place,"?")
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
- 🌰例子


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

## `createElement` --转换器  源码(带注释)

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

## `ReactElement` --组装  部分源码

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

- `ReactELement`的作用主要是用于组装reactElement对象,并把它返回给 `createElement`,再由 `createElement` 返回给开发者手中

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

`ReactElement` 本质上是JavaScript 对 DOM 的描述,也就是虚拟 DOM
- 而虚拟 DOM 和渲染到真实DOM 之间的处理就是由ReactDOM.render()来处理的

```jsx
ReactDOM.render(
	//需要渲染的元素(ReactElement)
  element,
  //元素挂载的目标容器(一个真实 DOM)
  container,
  //回调函数,可选参数,可以用来处理渲染结束后的逻辑
  [callback]
)
```

## 总结

![image _3_.png](https://s2.loli.net/2022/01/13/nWJHTuCIsZOBRcw.png)
