- 通过 context 保存权限列表
- 自定义路由判断权限.无权限跳转

```js
/* 数据模拟只有编写文档，和编写标签模块有权限，文档列表没有权限 */
function getRootPermission() {
  return new Promise((resolve) => {
    resolve({
      code: 200,
      data: ["/config/index", "/config/writeTag"],
    });
  });
}

const Permission = React.createContext([]);

export default function Index() {
  const [rootPermission, setRootPermission] = React.useState([]);
  React.useEffect(() => {
    // 获取权限列表
    getRootPermission().then((res) => {
      console.log(res, setRootPermission);
      const { code, data } = res;
      code === 200 && setRootPermission(data);
    });
  }, []);
  return (
    <Permission.Provider value={rootPermission}>
      <RootRouter />
    </Permission.Provider>
  );
}
```

```js
// 编写权限路由
export function PermissionRouter(props){
    const permissionList = useContext(Permission) /* 消费权限列表 */
    const isMatch = permissionList.indexOf(props.path) >= 0 /* 判断当前页面是否有权限 */
    return isMatch ? <Route {...props}  /> : <Redirect to={'/config/NoPermission'}  />
```

```js
<Switch>
  <PermissionRouter path={"/config/index"} component={WriteDoc} />
  <PermissionRouter path={"/config/docList"} component={DocList} />
  <PermissionRouter path={"/config/writeTag"} component={WriteTag} />
  <PermissionRouter path={"/config/tagList"} component={TagList} />
  <Route path={"/config/NoPermission"} component={NoPermission} />
</Switch>
```
