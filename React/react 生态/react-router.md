# React-router

## 路由的原理

### history,React-router,React-router-dom 三者的关系

- `history`: React-router 的核心,包含两种路由模式下改变路由的方法，和监听路由变化方法等
- `react-router`:通过路由的更新渲染视图
- `react-router-dom`:UI 层面的拓展如 Link,NavLink;两种模式的跟路由 `BrowserRouter`,`HashRouter`

![](https://pic.qingsds.cn/7ff05efcf1d04fefaa4c2b94d09827bd~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

### 路由的两种模式

- history 模式:`http://www.xxx.com/main`
- hash 模式:`http://www.xxx.com/#/main`
- 直接从 `react-router-dom` 引用 BrowserRouter 或 HashRouter 即可

### BrowserHistory

1. 改变路由的方法
   1. `window.history.pushState`方法
   2. `history.replaceState`方法(会修改 history 对象记录,但 `history.length` 长度不会改变)
2. 监听路由 `popState`
   1. `popState` 事件只会在浏览器某些行为下触发,如 back,forward,go
   2. `pushState` 和 `replaceState` 不会触发

```js
/**
 * @state 一个指定网址相关的状态对象,popstate 事件触发时,该对象会传入回调函数内
 * @title 新页面的标题,目前浏览器用不上,可填写 null
 * @path 新网址
 **/
history.pushState(state, title, path);
```

### HashHistory

1. 改变路由
   1. window.location.hash
2. 监听路由
   1. onhashchange

## React-Router 构成

- history 对象
  - 保存着改变路由方法 push,replace,和监听路由方法 listen
- location 对象
  - 当前状态下的路由信息,包括 pathname,state
- match 对象
  - 用来证明当前路由的匹配信息对象,存放着当前路由的 path 信息

### Router

> Router 是整个应用路由的传递者和派发更新者

不同模式下注入不同的 history 对象

![](https://pic.qingsds.cn/49d8c80ea16d4ff59b51412559942cf6~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

### Route

匹配路由，路由匹配，渲染组件

四种 Router 编写方式

```js
function Index() {
  const mes = { name: "alien", say: "let us learn React!" };
  return (
    <div>
      <Meuns />
      <Switch>
        {/* Route Component形式 */}
        <Route path="/router/component" component={RouteComponent} />
        {/* Render形式 */}
        <Route
          path="/router/render"
          render={(props) => <RouterRender {...props} />}
          {...mes}
        />
        {/* chilren形式 */}
        <Route path="/router/children">
          <RouterChildren {...mes} />
        </Route>
        {/* renderProps形式 */}
        <Route path="/router/renderProps">
          {(props) => <RouterRenderProps {...props} {...mes} />}
        </Route>
      </Switch>
    </div>
  );
}
export default Index;
```

- component 形式:会隐式将路由信息注入到组件页面的 props 中,但无法传递父组件中的信息
- render 形式: 属性接收一个渲染函数,函数参数就是路由信息,传递给页面组件,也可以传入父组件信息
- children 形式: 无法传入路由信息,但能传入父组件信息
- renderProps 形式: 将 children 作为渲染函数执行,可以传递路由信息,混入父组件信息

#### exact

精确匹配,pathname 必须和 Route 的 path 完全匹配才能展示路由信息

```js
<Route path="/router/component" exact component={RouteComponent} />
```

只有 `path="/router/component"` 正常显示,其他都不行 比如`"/router/component/a"`.**只要当前路由下有嵌套子路由，就不要加 exact**

### Switch

用是先通过匹配选出一个正确路由 Route 进行渲染

### Redirect

> `Redirect` 可以在路由不匹配情况下跳转指定某一路由，适合路由不匹配或权限路由的情况

情况一,当输入`/router/test`,没有路由匹配,重定向到`/router/home`

```js
<Switch>
  <Route path="/router/home" component={Home} />
  <Route path="/router/list" component={List} />
  <Route path="/router/my" component={My} />
  <Redirect from={"/router/*"} to={"/router/home"} />
</Switch>
```

情况二, `/router/list` 页面没有权限，那么会渲染 `Redirect` 就会重定向跳转到 `/router/home`，反之有权限就会正常渲染 `/router/list`

```js
noPermission ? (
  <Redirect from={"/router/list"} to={"/router/home"} />
) : (
  <Route path="/router/list" component={List} />
);
```

**注意 `Switch` 包裹的 `Redirect` 要放在最下面，否则会被 `Switch` 优先渲染 `Redirect` ，导致路由页面无法展示.**

## 从路由改变到页面跳转流程图

![](https://pic.qingsds.cn/05eddc3893034f4a99d4874ef8cebfc3~tplv-k3u1fbpfcp-watermark.awebp?imgqsds)

## React-router 使用指南

### 获取状态

#### 路由组件

```js
class Home extends React.Component {
  render() {
    return (
      <div>
        <Children {...this.props} />
      </div>
    );
  }
}
```

若 Home 组件被 Route 包裹,则可以通过 props 方式来传递路由信息

#### withRouter

```js
import { withRouter } from "react-router-dom";
@withRouter
class Home extends React.Component {
  componentDidMount() {
    console.log(this.props.history);
  }
  render() {
    return <div>{/* ....*/}</div>;
  }
}
```

对于距离较远的深层组件,使用`withRouter`获取 history,location 信息

#### useHistory 和 useLocation

```js
import { useHistory, useLocation } from "react-router-dom";
function Home() {
  const history = useHistory(); /* 获取history信息 */
  const useLocation = useLocation(); /* 获取location信息 */
}
```

### 路由跳转

- 声明式:`<NavLink to='/home' />`
- 函数式:`history.push('/home')`

### 路由传参

#### url 拼接

```js
const name = "qingsds";
const message = "JavaScript";
history.push(`/home?name=${name}&message=${message}`);
```

#### state 路由状态

```js
const name = "qingsds";
const message = "javaScript";
history.push({
  pathname: "/home",
  state: {
    name,
    message,
  },
});
```

从 `location`对象上获取 state

```js
const { state = {} } = this.props.location;
const { name, message } = state;
```

#### 动态路径参数路由

**绑定路由**

```js
<Route path="/post/:id" />
```

**路由跳转**

```js
history.push("/post/" + id); //id 为参数
```

#### 路由嵌套

```js
/* 第二层嵌套路由 */
function Home() {
  return (
    <div>
      <Route path="/home/test" component={Test} />
      <Route path="/home/test1" component={Test1} />
    </div>
  );
}

/* 第一层父级路由 */
function Index() {
  return (
    <Switch>
      <Route path="/home" component={Home} />
      <Route path="/list" component={List} />
      <Route path="/my" component={My} />
    </Switch>
  );
}
```

嵌套路由子路由一定要跟随父路由。比如父路由是 `/home` ，那么子路由的形式就是 `/home/xxx` ，否则路由页面将展示不出来.

#### 自定义路由

```js
function CustomRouter(props) {
  const permissionList = useContext(permissionContext); /* 获取权限列表 */
  const haspermission = matchPermission(
    permissionList,
    props.path
  ); /* 检查是否具有权限 */
  return haspermission ? <Route {...props} /> : <Redirect to="/noPermission" />;
}
```

此路由可以检查路由是否具有权限,若没有,直接重定向到没有权限页面
