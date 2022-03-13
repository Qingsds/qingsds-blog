# Ref

## 类组件获取 Ref 的方式

### ref 属性是一个函数

```js
class Children extends React.Component {
  render = () => <div>hello,world</div>;
}
/* Ref属性是一个函数 */
export default class Index extends React.Component {
  currentDom = null;
  currentComponentInstance = null;
  componentDidMount() {
    console.log(this.currentDom);
    console.log(this.currentComponentInstance);
  }
  render = () => (
    <div>
      <div ref={(node) => (this.currentDom = node)}>Ref模式获取元素或组件</div>
      <Children ref={(node) => (this.currentComponentInstance = node)} />
    </div>
  );
}
```

![](https://pic.qingsds.cn/2022-02-26-11.24.27.png?imgqsds)

当用一个函数来标记 Ref 的时候，将作为 callback 形式，等到真实 DOM 创建阶段，执行 callback ，获取的 DOM 元素或组件实例，将以回调函数第一个参数形式传入 可以用组件实例下的属性 `currentDom和` `currentComponentInstance` 来接收真实 DOM 和组件实例

### ref 属性时 Ref 对象

```js
class Children extends React.Component {
  render = () => <div>hello,world</div>;
}
export default class Index extends React.Component {
  currentDom = React.createRef(null);
  currentComponentInstance = React.createRef(null);
  componentDidMount() {
    console.log(this.currentDom);
    console.log(this.currentComponentInstance);
  }
  render = () => (
    <div>
      <div ref={this.currentDom}>Ref对象模式获取元素或组件</div>
      <Children ref={this.currentComponentInstance} />
    </div>
  );
}
```

## forwardRef 转发 Ref 应用场景

### 跨层级获取

> 在 GrandFather 组件通过标记 ref ，来获取孙组件 Son 的组件实例

```js
import React from "react";
// 孙组件
function Son(props) {
  const { grandRef } = props;
  return (
    <div>
      <div> i am alien </div>
      <span ref={grandRef}>这个是想要获取元素</span>
    </div>
  );
}
// 父组件
class Father extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Son grandRef={this.props.grandRef} />
      </div>
    );
  }
}
const NewFather = React.forwardRef((props, ref) => (
  <Father grandRef={ref} {...props} />
));
// 爷组件
export default class GrandFather extends React.Component {
  constructor(props) {
    super(props);
  }
  node = null;
  componentDidMount() {
    console.log(this.node); // span #text 这个是想要获取元素
  }
  render() {
    return (
      <div>
        <NewFather ref={(node) => (this.node = node)} />
      </div>
    );
  }
}
```

forward 把 ref 变成了可以通过 props 传递和转发

### 合并转发 ref

> 通过 Home 绑定 ref，来获取子组件 Index 的实例 index，dom 元素 button，以及孙组件实例

```js
// index 组件
class Index extends React.Component {
  componentDidMount() {
    const { forwardRef } = this.props;
    forwardRef.current = {
      form: this.form, // 给form组件实例 ，绑定给 ref form属性
      index: this, // 给index组件实例 ，绑定给 ref index属性
      button: this.button, // 给button dom 元素，绑定给 ref button属性
    };
  }
  form = null;
  button = null;
  render() {
    return (
      <div>
        <button ref={(button) => (this.button = button)}>点击</button>
        <Form ref={(form) => (this.form = form)} />
      </div>
    );
  }
}

const ForwardRefIndex = React.forwardRef((props, ref) => (
  <Index {...props} forwardRef={ref} />
));
// home 组件
export default function Home() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    console.log(ref.current);
  }, []);
  return <ForwardRefIndex ref={ref} />;
}
```

流程:

- 通过 useRef 创建一个 ref 对象,通过 forward 将 ref 传递给子组件
- 向 home 组件传递的 ref 上绑定 Index 组件的实例和其他 dom 元素

### 高阶组件转发

```js
function HOC(Component) {
  class Wrap extends React.Component {
    render() {
      const { forwardedRef, ...otherProps } = this.props;
      return <Component ref={forwardedRef} {...otherProps} />;
    }
  }
  return React.forwardRef((props, ref) => (
    <Wrap forwardedRef={ref} {...props} />
  ));
}

class Index extends React.Component {
  render() {
    return <div>hello world!</div>;
  }
}

const IndexHoc = HOC(Index);

export default function A() {
  const node = React.useRef(null);
  React.useEffect(() => {
    console.log(node.current);
  }, []);
  return (
    <div>
      <IndexHoc ref={node} />
    </div>
  );
}
```

## ref 实现组件通信

### 类组件 使用 ref 通信

```js
class Son extends React.PureComponent {
  state = {
    fMes: "",
    sMes: "",
  };
  // 提供给父组件的函数
  fatherSay = (fMes) => this.setState({ fMes });
  render() {
    const { fMes, sMes } = this.state;
    return (
      <div>
        <div>son component</div>
        <p>father say:{fMes}</p>
        <div>to father</div>
        <input onChange={(e) => this.setState({ sMes: e.target.value })} />
        <button onClick={() => this.props.toFather(sMes)}>to father</button>
      </div>
    );
  }
}

export default function Father() {
  const [fMes, setFMes] = React.useState("");
  const [sMes, setSMes] = React.useState("");
  const instance = React.useRef(null); //用来获取子组件实例
  const toSon = () => instance.current.fatherSay(fMes);
  return (
    <div>
      <div>father component</div>
      <p>son say:{sMes}</p>
      <div>to son</div>
      <input onChange={(e) => setFMes(e.target.value)} />
      <button onClick={toSon}>to son</button>
      <Son toFather={setSMes} ref={instance} />
    </div>
  );
}
```

- 子组件暴露 `fatherSay`供父组件使用,父组件调用方法改变子组件的 state
- 父组件提供给子组件 `toFather`，子组件调用，改变父组件展示内容，实现父子双向通信

### 函数组件 使用 ref 通信

#### `useImperativeHandle` 的基本使用

- 第一个参数 ref:接收 forwardRef 传递过来的参数
- 第二个参数 createHandle: 处理函数,返回值将作为暴露给父组件的 ref 对象
- 第三个参数 deps:依赖项 deps,依赖项更改 形成新的 ref 对象

#### `forwardRef` + `useImperativeHandle` 流程图

![](https://pic.qingsds.cn/59238390306849e89069e6a4bb6ded9d~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

#### 实例

```js
import React from "react";
// 子组件
function Son(props, ref) {
  const inputRef = React.useRef(null);
  const [inputValue, setInputValue] = React.useState("");
  React.useImperativeHandle(
    ref,
    () => {
      const handleRefs = {
        onFocus() {
          inputRef.current.focus();
        },
        onChangeValue(value) {
          setInputValue(value);
        },
      };
      return handleRefs;
    },
    []
  );
  return (
    <div>
      <input
        placeholder="请输入内容"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputVal(e.target.value)}
      />
    </div>
  );
}

const ForwardSon = React.forwardRef(Son);
// 父组件
export class Index extends React.Component {
  cur = null;
  handleClick() {
    const { onFocus, onChangeValue } = this.cur;
    onFocus(); 
    onChangeValue("let us learn React!"); 
  render() {
    return (
      <div style={{ marginTop: "50px" }}>
        <ForwardSon ref={(cur) => (this.cur = cur)} />
        <button onClick={this.handleClick.bind(this)}>操控子组件</button>
      </div>
    );
  }
}
```

- 父组件使用 ref 标记子组件,由于子组件是 Son 是函数组件没有实例,所以用 forwardRef 转发 ref
- 子组件 Son 用 `useImperativeHandle` 接收父组件 ref 将让 input 聚焦的方法 onFocus 和 改变 input 输入框的值的方法 `onChangeValue` 传递给 ref
- 父组件可以通过调用 ref 下的 onFocus 和 onChangeValue 控制子组件中 input 赋值和聚焦

## 使用 ref 缓存数据

- 在执行一些事件方法改变数据或者保存新数据的时候,没必要更新试图
- 使用 ref 缓存可以直接修改数据,不会造成函数组件冗余的更新
- 使用 `useEffect` `useMemo` 引用 ref 对象中的数据,不用将对象添加成 rep 依赖项(useRef 始终指向一个内存空间)

## ref 原理

> `ref` 的处理都是在 commit 阶段发生的.
> commit 的阶段会进行真正的 DOM 操作,此时 ref 用来获取真实 DOM 以及组件实例

![](https://pic.qingsds.cn/08a2393077634beaad2b91f971ab381f~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

ref 的处理函数

- `commitDetachRef` 和 `commitAttachRef`
- `commitDetachRef` DOM 更新前触发()
- `commitAttachRef` DOM 更新后触发

### commitDetachRef

commitDetachRef 会清空之前 ref 值，使其重置为 null

### commitAttachRef

根据 ref 同的获取方式进行更新(如果是对象方式,则会更新 ref 对象的 current 属性)

### ref 的更新时机

```js
function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) || // 初始化的时候
    (current !== null && current.ref !== ref) // ref 指向发生改变
  ) {
    workInProgress.effectTag |= Ref;
  }
}
```

- `current` 为当前调和的 fiber 节点
- `current === null && ref !== null`：就是在 fiber 初始化的时候，第一次 ref 处理的时候，是一定要标记 Ref 的
- `current !== null && current.ref !== ref`：就是 fiber 更新的时候，但是 ref 对象的指向变了

- wan
