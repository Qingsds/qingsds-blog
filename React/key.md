# 从 diff children 看 key 的合理使用

## diff children 流程

### 遍历新 children 复用 oldFiber

```js
function reconcileChildrenArray(){
    /* 第一步  */
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
        if (oldFiber.index > newIdx) {
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling;
        }
        const newFiber = updateSlot(returnFiber,oldFiber,newChildren[newIdx],expirationTime,);
        if (newFiber === null) { break }
        // ..一些其他逻辑
        }
        if (shouldTrackSideEffects) {  // shouldTrackSideEffects 为更新流程。
            if (oldFiber && newFiber.alternate === null) {
              /* 找到了与新节点对应的fiber，但是不能复用，那么直接删除老节点 */
                deleteChild(returnFiber, oldFiber);
            }
        }
    }
}
```

- 遍历 `React.createElement` 产生新的 `child` 组成的数组,并使用 `oldFiber.sibling`移动指针,找到对应的 `oldFiber`
- 调用 `updateSlot` 判断 tag 和 key 是否匹配,匹配复用 oldFiber 形成新 fiber,不匹配返回 null , `newFiber = null`
- `shouldTrackSideEffects` 表示处于更新流程, 找到与新节点对应的,不能复用的老 fiber(`alternate === null`),删除老 fiber

### 删除节点

```js
if (newIdx === newChildren.length) {
  deleteRemainingChildren(returnFiber, oldFiber);
  return resultingFirstChild;
}
```

- `newIdx === newChildren.length` 说明所有的 newChildren 全部被遍历完,剩下的 oldFiber 没有用了, 统一删除剩余的 oldFiber `deleteRemainingChildren(returnFiber, oldFiber);`

```text
oldChild: A B C D
newChild: A B
A,B 经过遍历复制完成,此时 C D 没用了, 统一删除
```

### 节点增加

```js
if (oldFiber === null) {
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = createChild(
      returnFiber,
      newChildren[newIdx],
      expirationTime
    );
    // ...
  }
}
```

- 遍历完之后 `oldFiber === null` 表示 oldFiber 复用完毕
- 如果还有新的 Children 说明都是新元素,直接调用 `createChild` 创建新 fiber

```text
oldChild: A B
newChild: A B C D
直接创建 C D
```

### 节点位置改变

```js
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
for (; newIdx < newChildren.length; newIdx++) {
  const newFiber = updateFromMap(existingChildren, returnFiber);
  /* 从mapRemainingChildren删掉已经复用oldFiber */
}
```

- `mapRemainingChildren` 返回一个存放着老 fiber 和对应 key(或 index)映射关系
- 遍历剩下没有处理的 Children 通过 `updateFromMap` 判断是否有可以复用的 oldFiber,有则直接复用,没有创建新的
- 复用的 oldFiber 会从 `mapRemainingChildren`删除

```text
oldChild: A B D C
newChild: A B C D
C D 被复用 existingChildren 为空
```

### 复杂情况(删除+新增+移动)

```js
if (shouldTrackSideEffects) {
  /* 移除没有复用到的oldFiber */
  existingChildren.forEach((child) => deleteChild(returnFiber, child));
}
```

- 删除剩余没有复用的 oldFiber

```text
oldChild: A B C D
newChild: A E C B
```

- A 首先被复用
- E 经过`updateFromMap`判断之后直接创建
- B C 经过`updateFromMap`后被复用
- D 被删除

## key 的合理使用

- key 要确保唯一性
- 若使用 index 作为 key,发生元素移动,那么 fiber 就不会得到合理的复用 index 拼接字符串也会造成相同效果
