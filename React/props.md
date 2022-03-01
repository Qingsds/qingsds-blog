# props

## React 中的 props 可以是什么

```js
import React from "react";

/* children 组件 */
function ChildrenComponent() {
  return <div> In this chapter, let's learn about react props ! </div>;
}

/* props 接受处理 */
class PropsComponent extends React.Component {
  componentDidMount() {
    console.log(this, "_this");
  }
  render() {
    const { children, mes, renderName, say, Component } = this.props;
    const renderFunction = children[0];
    const renderComponent = children[1];
    /* 对于子组件，不同的props是怎么被处理 */
    return (
      <div>
        {renderFunction()}
        {mes}
        {renderName()}
        {renderComponent}
        <Component />
        <button onClick={() => say()}> change content </button>
      </div>
    );
  }
}

/* props 定义绑定 */
export default class Props extends React.Component {
  state = { mes: "hello react!" };
  node = null;
  say = () => {
    this.setState({ mes: "let us learn React!" });
  };
  render() {
    return (
      <div>
        <PropsComponent
          // 渲染数据源
          mes={this.state.mes}
          // 回调函数
          say={this.say}
          // 组件
          Component={ChildrenComponent}
          // 渲染函数
          renderName={() => <div>my name is qsds</div>}
        >
          {() => <div>hello world!</div>}
          <ChildrenComponent />
        </PropsComponent>
      </div>
    );
  }
}
```

控制台输出:

![](https://pic.qingsds.cn/2022-02-25.png?imgqsds)

### props 的作用

- `mes` 作为子组件的渲染数据
- `this.say` 作为通知父组件的回调
- `ChildrenComponent` 作为组件传递
- `renderName` 渲染函数
- `{() => <div>hello world!</div>}`作为子组件放在了 children 里
- `<ChildrenComponent />` 插槽组件(插槽组件也会被放在 children 属性中)

## 如何监听 props 的改变

### 类组件

- `componentWillReceiveProps`(未来版本会被废弃)
- `getDerivedStateFromProps`

### 函数组件

- 函数组件中同理可以用 `useEffect` 来作为 `props` 改变后的监听函数。(`useEffect` 初始化会默认执行一次)

```js
React.useEffect(()=>{
    // props 中number 改变，执行这个副作用。
    console.log('props改变：' ，props.number  )
},[ props.number ])
```

## props children 模式

### props 插槽组件

```js
<Container>
  <Children>
</Container>
```

在 Container 组件中,通过 props.children 属性可以访问到 Child 组件

- 可以根据需要控制 Children 是否渲染
- Container 可以用 React.cloneElement 强化 props 或者修改 Children 的子元素。

### render props 模式

```js
<Container>{(ContainerProps) => <Children {...ContainerProps} />}</Container>
```

这种情况下 Container 中 props.children 访问到的是函数,不是 ReactElement 对象,并不能直接渲染

```js
function Container(props) {
  const ContainerProps = {
    name: "qingsds",
    mes: "find a job",
  };
  return props.children(ContainerProps);
}
```

- 根据需要控制 Children 是否渲染
- 可以将需要传给 Children 的 props 直接通过函数参数的方式传递给执行函数 children

### 混合模式

```js
<Container>
  <Children />
  {(ContainerProps) => <Children {...ContainerProps} name={"qingsds"} />}
</Container>
```

![](https://pic.qingsds.cn/2022-02-2516.03.15.png?imgqsds)

```js
const Children = (props) => (
  <div>
    <div>hello, my name is {props.name} </div>
    <div> {props.mes} </div>
  </div>
);

function Container(props) {
  const ContainerProps = {
    name: "qingsds",
    mes: "let us learn react",
  };
  return props.children.map((item) => {
    if (React.isValidElement(item)) {
      // 判断是 react element 注入 props
      return React.cloneElement(
        item,
        { ...ContainerProps },
        item.props.children
      );
    } else if (typeof item === "function") {
      return item(ContainerProps);
    } else return null;
  });
}

const Index = () => {
  return (
    <Container>
      <Children />
      {(ContainerProps) => <Children {...ContainerProps} name={"haha"} />}
    </Container>
  );
};
```
