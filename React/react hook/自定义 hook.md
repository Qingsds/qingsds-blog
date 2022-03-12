# 自定义 hook

## 自定义 hook 的规则

- 命名以`use`开头,函数内部可以调用其他 hook

## 使用指南

### 接收状态

例子

```js
export default function useHistory() {
  return useContext(RouterContext).history;
}
```

如果使用了含有 `useContext`的自定义 hook,当 `context` 上下文改变时,会使使用自定义 `hook` 的组件渲染

### 储存&管理状态

自定义 hooks 可以用来储存管理状态,本质上是用 useRef 保存对象

储存状态

```js
function useForm() {
  const formCurrent = useRef(null);
  if (!formCurrent.current) {
    formCurrent.current = new FormStore();
  }
  return formCurrent.current;
}
```

记录状态

下面例子记录组件执行的次数,是否是第一次执行

```js
function useRenderCount() {
  // 记录是否第一次渲染📝
  const isFirstRender = useRef(true);
  // 记录渲染次数📝
  const renderCount = useRef(1);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);
  useEffect(() => {
    if (!isFirstRender.current) renderCount.current++;
  });
  return [isFirstRender.current, renderCount.current];
}
```

### 更新状态

改变状态(实现一个防抖节流 hook)

```js
// 方案 1
export const useDebounce = (value, delay) => {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(value);
    }, delay);
    // 每次在 useEffect 处理完之后运行(每次 value 或 delay 变化时重新执行)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return result;
};

// 方案 2
export function debounce(fn, time) {
  let timer = null;
  return function (...arg) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arg);
    }, time);
  };
}

function useDebounceState(defaultValue, time) {
  const [value, changeValue] = useState(defaultValue);
  /* 对 changeValue 做防抖处理   */
  const newChange = React.useMemo(() => debounce(changeValue, time), [time]);
  return [value, newChange];
}
```

### `useState` 和 `useRef`

- useRef 只要组件不销毁，一直存在，而且可以随时访问最新状态值
- useState 可以让组件更新，但是 state 需要在下一次函数组件执行的时候才更新，而且如果想让 useEffect 或者 useMemo 访问最新的 state 值，需要将 state 添加到 deps 依赖项中

实现同步的 state

```js
function useAsyncState(defaultVal) {
  // ref 保存状态
  const val = useRef(defaultVal);
  // useState 更新组件
  const [, forceUpdate] = useState(null);
  // 模拟更新函数
  const dispatch = (fn) => {
    let newVal;
    if (typeof fn === "function") {
      newVal = fn(val.current);
    } else {
      newVal = fn;
    }
    val.current = newVal;
    // 强制更新
    forceUpdate({});
  };
  return [val, dispatch];
}
```

- `useRef` 用于保存状态 ，`useState` 用于更新组件
- `dispatch` 在内部调用 `forceUpdate` 强制更新
- 返回的结构和 `useState` 结构相同。不过注意的是使用的时候要用 `value.current`

### 操作 DOM&组件

```js
function useGetDOM() {
  const dom = useRef();
  useEffect(() => {
    //.....
    console.log(dom.current);
  }, []);
  return dom;
}

export default function App(){
  const dom = useGetDOM();
  return <div ref={dom}>
      hello,world
  </div>
}
```

### 副作用

用来监听props 和state 变化带来的副作用,当 value 改变时,执行 callback

```js
function useEffectProps(val,callback){
  const isMounted = useRef(false);
  useEffect(() => {
    // 此时组件已挂在
    isMount.current = true;
  },[])
  useEffect(() => {
    // 若已经挂载 每当 val 变化时,执行 callback
    isMount.current && callback && callback()
  },[val])
}
```
