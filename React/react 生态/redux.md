# redux

## redux 三大原则

- 单项数据流
  - 数据流是单项的.
- state 只读
  - 不能直接改变 state,想要改变 state,必须触发 action,通过 action 执行 reducer
- 纯函数执行
  - 每一个 reducer 都是纯函数,里面不能执行副作用操作,返回的值作为新的 state,state 改变会触发 store 中的 subscribe

## 中间件

> 中间件的作用只有一个----强化 dispatch

compose 实现

```js
const compose = (...funcs) => {
  return funcs.reduce((f, g) => (x) => f(g(x)));
};
```

`funcs` 为中间件组成的数组，compose 通过数组的 reduce 方法，实现执行每一个中间件，强化 dispatch 。

## 核心 api

### createStore

redux 通过 createStore 创建一个 store

```js
const Store = createStore(rootReducer, initialState, middleware);
```

- `rootReducer`: `redux` 中的 `reducer`,如果有多个可以调用 `combineReducers`
- `initialState`: 初始化的 state
- `middleware`: 若有中间件,fun 放在 redux 中间件

### combineReducers

```js
/* 将 number 和 PersonalInfo 两个reducer合并   */
const rootReducer = combineReducers({
  number: numberReducer,
  info: InfoReducer,
});
```

- `combineReducers` 可以合并多个 `reducer`

### applyMiddleware

```js
const middleware = applyMiddleware(logMiddleware);
```

- `applyMiddleware` 用于注册中间件,支持多个参数,每个参数都是一个中间件,每次触发 action,中间件一次执行

## 使用指南

1. 编写 reducer

```js
// num reducer
function numReducer(state = 0, action) {
  switch (action.type) {
    case "ADD":
      return state + 1;
    case "REC":
      return state - 1;
    default:
      return state;
  }
}

// info reducer
function InfoReducer(state = {}, action) {
  const { payload = {} } = action;
  switch (action.type) {
    case "SET":
      return {
        ...state,
        ...payload,
      };
    default:
      return state;
  }
}
```

2. 注册中间件

```js
// 打印中间件
// 第一层在 compose 中执行
function logMiddleware() {
  //第二层在 reduce 中被执行
  return (next) => {
    // 返回强化后的 dispatch
    return (action) => {
      const { type } = action;
      console.log("发生一次 action:", type);
      return next(action);
    };
  };
}
```

3. 生成 store

```js
/* 注册中间件  */
const rootMiddleware = applyMiddleware(logMiddleware);
/* 注册reducer */
const rootReducer = combineReducers({
  num: numReducer,
  info: InfoReducer,
});
/* 合成Store */
const Store = createStore(
  rootReducer,
  { num: 1, info: { name: null } },
  rootMiddleware
);
```

4. 使用 redux

```js
function Index() {
  const [state, setState] = useState(Store.getState());
  useEffect(() => {
    const unSubscribe = Store.subscribe(() => {});
    setState(Store.getState());
    return () => unSubscribe();
  }, []);

  return (
    <div>
      <p>
        {state.info.name
          ? `hello, my name is ${state.info.name}`
          : "what is your name"}{" "}
        ,{state.info.mes ? state.info.mes : " what do you say? "}
      </p>
      hello world{state.num} 👍 <br />
      <button
        onClick={() => {
          Store.dispatch({ type: "ADD" });
        }}
      >
        点赞
      </button>
      <button
        onClick={() => {
          Store.dispatch({
            type: "SET",
            payload: { name: "qingsds", mes: "focus!" },
          });
        }}
      >
        修改标题
      </button>
    </div>
  );
}
```


