# ErrorBoundary

```js
import React, { ReactElement } from "react";

type fallBackRender = (error: { error: Error | null }) => ReactElement;

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallBackRender: fallBackRender }>,
  { error: Error | null }
> {
  state = { error: null };
  // 当子组件抛出异常,这里会接收到并调用
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    const { fallBackRender, children } = this.props;
    if (error) {
      return fallBackRender(error);
    }
    return children;
  }
}
```
