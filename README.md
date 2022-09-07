## 组件化好处

1. 可复用
2. 方便维护
3. 可以实现局部更新

每个响应式数据对应着一个 dep，dep 收集多个 watcher
watcher 是一个视图的渲染方法，每个视图（watcher）会有多个响应式数据（dep）
所以 dep 和 watcher 是多对多的

数据刷新是异步的，每次触发 watcher 更新会将其推入数组，等所有同步执行完成，开始执行微任务，执行 watcher 数组
