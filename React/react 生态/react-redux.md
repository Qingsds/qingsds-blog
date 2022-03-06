# React-Redux

## 功能

- 接受 Redux 的 store,并把它合理分配到所需要的组件中
- 订阅 store 中 state 的改变,促使消费对应的 state 组件更新

## 用法

### Provider

- 保存 redux 中的 store,分配给所需要 state 的子孙组件

```js
export default function App() {
  return (
    <Provider store={store}>
      <Index />
    </Provider>
  );
}
```

### connect

- 从 props 中获取改变 state 的方法 Store.dispatch
- 如果 connect 有第一个参数,就会将 store 中的数据映射到当前组件的 props 中,子组件可以使用消费
- 当需要的 state,有变化的时候,会通知当前组件更新,重新渲染视图

```js
function connect(mapStateToProps?,mapDispatchToProps?,mergeProps?,options?)
```

#### mapStateToProps

```js
const mapStateToProps = (state) => ({ info: state.info });
```

- 将 state 映射到 props 中,当 `info`改变时,触发更新,`info`不变时,不会订阅 store 的改变

#### mapDispatchToProps

```js
const mapDispatchToProps = (dispatch) => {
  return {
    numAdd: () => dispatch({ type: "ADD" }),
    setInfo: () => dispatch({ type: "SET" }),
  };
};
```

- 将 redux 中的 dispatch 方法映射到组件 props 中

#### mergeProps

```js
/*
 * stateProps , state 映射到 props 中的内容
 * dispatchProps， dispatch 映射到 props 中的内容。
 * ownProps 组件本身的 props
 */
(stateProps, dispatchProps, ownProps) => Object;
```

- 可以返回一个对象,自定义的合并规则,附加属性

#### options

```js
{
  context?: Object,   // 自定义上下文
  pure?: boolean, // 默认为 true , 当为 true 的时候 ，除了 mapStateToProps 和 props ,其他输入或者state 改变，均不会更新组件。
  areStatesEqual?: Function, // 当pure true , 比较引进store 中state值 是否和之前相等。 (next: Object, prev: Object) => boolean
  areOwnPropsEqual?: Function, // 当pure true , 比较 props 值, 是否和之前相等。 (next: Object, prev: Object) => boolean
  areStatePropsEqual?: Function, // 当pure true , 比较 mapStateToProps 后的值 是否和之前相等。  (next: Object, prev: Object) => boolean
  areMergedPropsEqual?: Function, // 当 pure 为 true 时， 比较 经过 mergeProps 合并后的值 ， 是否与之前等  (next: Object, prev: Object) => boolean
  forwardRef?: boolean, //当为true 时候,可以通过ref 获取被connect包裹的组件实例。
}
```


