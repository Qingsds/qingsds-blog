# React.lazy + Suspense 模拟异步组件功能

> 此 demo 仅作参考,不能用于真实开发场景

```js
import React, { Suspense } from "react";
/**
 * AsyncComponent 异步组件
 * @param {*} Component 异步数据的组件
 * @param {*} api 请求数据的接口,返回 Promise
 */
function AsyncComponent(Component, api) {
  const AsyncComponentPromise = () =>
    new Promise(async (resolve) => {
      const data = await api();
      resolve({
        default: (props) => <Component data={data} {...props} />,
      });
    });
  return React.lazy(AsyncComponentPromise);
}

// 模拟数据
const getData = () => {
  return new Promise((resolve) => {
    // 模拟异步请求
    setTimeout(() => {
      resolve({
        name: "qingsds",
        say: "let us learn javaScript !",
      });
    }, 1000);
  });
};

function Test({ data, age }) {
  const { name, say } = data;
  console.log("test 组件渲染");
  return (
    <div>
      <div>my name is {name}</div>
      <div>i am {age} years old</div>
      <div>{say}</div>
    </div>
  );
}

export default class Index extends React.Component {
  LazyComponent = AsyncComponent(Test, getData);
  render() {
    const { LazyComponent } = this;
    return (
      <div>
        <Suspense fallback={<div>loading...</div>}>
          <LazyComponent />
        </Suspense>
      </div>
    );
  }
}
```

- 思路:
  - 用 AsyncComponent 包装组件，接受两个参数，第一个参数为当前组件，第二个参数为请求数据的 api
  - 声明一个返回值为 Promise 函数给 React.lazy 作为回调函数
