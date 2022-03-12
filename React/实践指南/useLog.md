```js
export const LogContext = React.createContext({});

function useLog() {
  // 一些公共参数
  const message = useContext(LogContext);
  const listenDOM = useRef(null);

  // 分清依赖关系,message 改变,reportMessage重新声明
  const reportMessage = React.useCallback(
    function (data, type) {
      if (type === "pv") {
        //pv 上报
        console.log("组件 pv 上报", message);
      } else if (type === "click") {
        //点击上报
        console.log("组件 click 上报", message, data);
      }
    },
    [message]
  );
  //reportMessage 改变,就重新绑定元素
  useEffect(() => {
    const handleClick = function (e) {
      reportMessage(e.target, "click");
    };
    if (listenDOM.current) {
      listenDOM.current.addEventListener("click", handleClick);
    }
    return function () {
      listenDOM.current &&
        listenDOM.current.removeEventListener("click", handleClick);
    };
  }, [reportMessage]);

  return [listenDOM, reportMessage];
}

function Home() {
  const [dom, reportMessage] = useLog();
  return (
    <div>
      <div ref={dom}>
        <p>hello,world</p>
        <button>按钮 one (内部点击)</button>
        <button>按钮 two (内部点击)</button>
        <button>按钮 three (内部点击)</button>
      </div>
      <button
        onClick={() => {
          console.log(reportMessage);
        }}
      >
        外部点击
      </button>
    </div>
  );
}

const Index = React.memo(Home); //阻断 useState 的更新

function Root() {
  const [val, setVal] = useState({});
  return (
    <LogContext.Provider value={val}>
      <Index />
      <button onClick={() => setVal({ name: "qingsds", age: "18" })}>
        点击
      </button>
    </LogContext.Provider>
  );
}
```

