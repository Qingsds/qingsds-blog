# HOC

## 概念

> 高阶组件是以组件作为参数，返回组件的函数，返回的组件把传进去的组件进行功能强化。

![](https://pic.qingsds.cn/97a76447f740458f91982e4038e46d2e~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

## 属性代理

```js
function Hoc(Component) {
  return class Advance extends React.Component {
    state = {
      name: "qingsds",
    };
    render() {
      return <Component {...this.props} {...this.state} />;
    }
  };
}
```

- 优点:
  - 属性代理可以和业务组件低耦合,零耦合
  - 类组件函数组件都可以用
  - 可以嵌套
- 缺点:
  - 无法获取原始组件的状态,如要获取,需要 ref 获取组件实例
  - 无法继承静态属性
  - 本质上是产生了一个新的组件,需要配合 forwardRef 来转发 ref

## 反向继承

```js
class Index extends React.Component {
  render() {
    return <div>have a good day :)</div>;
  }
}
function Hoc(Component) {
  // 继承需要包装的组件
  return class WrapComponent extends Component {
    //.....
  };
}
export default Hoc(Index);
```

- 优点:
  - 方便获取组件内部状态(state,props,声明周期,绑定的事件函数等)
- 缺点
  - 函数组件无法使用
  - 和被包装组件耦合度高
  - 如果多个反向继承 hoc 嵌套在一起,当前状态会覆盖上一个状态

## 高阶组件使用说明

### 强化 props

> react-router 提供了类似 withRouter 的 HOC 让组件也可以获取到路由对象，进行路由跳转等操作

```js
function withRouter(Component) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = (props) => {
    const { wrapperComponentRef, ...remainingProps } = props;
    return (
      <RouterContext.Consumer>
        {(context) => {
          return (
            <Component
              {...remainingProps}
              {...context}
              ref={wrapperComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };
  C.displayName = displayName;
  C.wrapperComponent = Component;
  //继承静态属性
  return histStatics(C, Component);
}
```

- 将转发的 ref 和 otherProps 分离
- `RouterContext.Consumer`上下文路由信息传递给原始组件
- 可以在原始组件中获取 history location 等信息

### 控制渲染

#### 渲染劫持

```js
const HOC = (WrapComponent) =>
  class Index extends WrapComponent {
    render() {
      if (this.props.visible) {
        return super.render();
      } else {
        return <div>暂无数据</div>;
      }
    }
  };
```

#### 修改渲染树

```js
import React from "react";
class Index extends React.Component {
  render() {
    return (
      <div>
        <ul>
          <li>react</li>
          <li>vue</li>
          <li>javaScript</li>
        </ul>
      </div>
    );
  }
}

function HOC(Component) {
  return class Advance extends Component {
    render() {
      const element = super.render(); //element => Index实例
      console.log(element);
      const otherProps = {
        name: "qingsds",
      };
      // 替换 react 节点
      const appendElement = React.createElement(
        "li",
        {},
        `have a good day! ${otherProps.name} :)`
      );
      const newChild = React.Children.map(
        element.props.children.props.children,
        (child, index) => {
          if (index === 0) return appendElement;
          return child;
        }
      );
      return React.cloneElement(element, element.props, newChild);
    }
  };
}
export default HOC(Index);
```

### 组件赋能

#### 获取 ref 实例

```js
import React from "react";
function HOC(Component) {
  return class WrapperComponent extends React.Component {
    constructor() {
      super();
      this.node = null; //获取实例
    }
    render() {
      return <Component ref={(node) => (this.node = node)} {...this.props} />;
    }
  };
}
```

**注意: 只有类组件才存在实例,函数组件不存在实例**

#### 事件监听

```js
import React, { useEffect } from "react";

class Index extends React.Component {
  render() {
    return (
      <div style={{ border: "solid 1px black" }}>
        <p>hello,world</p>
        <button>组件内部点击</button>
      </div>
    );
  }
}

function A() {
  return (
    <div style={{ border: "solid 1px black" }}>
      <Index />
      <button>组件外部点击</button>
    </div>
  );
}

function HandleClickHoc(Component) {
  return function Wrap(props) {
    const dom = React.useRef(null);
    useEffect(() => {
      const handleClick = () => console.log("点击事件触发");
      dom.current.addEventListener("click", handleClick);
      return () => dom.current.removeEventListener("click", handleClick);
    }, []);
    return (
      <div ref={dom}>
        <Component {...props} />
      </div>
    );
  };
}

export default HandleClickHoc(A);
```

### 要在函数组件内部或类组件 render 函数中使用 HOC 🙅🏻‍♀️

### 继承静态属性的第三方库 `hoist-non-react-statics`

```js
import hoistNonReactStatic from "hoist-non-react-statics";
function HOC(Component) {
  class WrappedComponent extends React.Component {
    /*...*/
  }
  hoistNonReactStatic(WrappedComponent, Component);
  return WrappedComponent;
}
```
