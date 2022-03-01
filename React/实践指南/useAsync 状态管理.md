# 用于状态管理的 hook

```js
import { useCallback, useState } from "react";

interface State<D> {
  data: D | null;
  status: "idle" | "error" | "loading" | "success";
  error: Error | null;
}

const defaultInitialState: State<null> = {
  data: null,
  status: "idle",
  error: null,
};

export const useAsync = <D>(initialState?: State<D>) => {
  const [state, setState] =
    useState <
    State <
    D >>
      {
        ...defaultInitialState,
        ...initialState,
      };

  const setData = useCallback((param: D) => {
    setState({
      data: param,
      status: "success",
      error: null,
    });
  }, []);

  const setError = useCallback((error: Error) => {
    setState({
      data: null,
      status: "error",
      error,
    });
  }, []);

  const run = useCallback(
    async (promise: Promise<D>) => {
      if (!promise || !promise.then) {
        throw new Error("请传入 Promise 类型参数");
      }
      setState((state) => ({ ...state, status: "loading" }));
      return promise
        .then((data) => {
          setData(data);
          return data;
        })
        .catch((error) => {
          setError(error);
          return error;
        });
    },
    [setData, setError]
  );

  return {
    isError: state.status === "error",
    isLoading: state.status === "loading",
    isIdle: state.status === "idle",
    isSuccess: state.status === "success",
    run,
    setData,
    setError,
    data: state.data,
    error: state.error,
  };
};
```
