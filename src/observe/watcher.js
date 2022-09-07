import Dep from "./dep";

let id = 0;

/**
 * 不同组件会有不同的 watcher 实例，通过 id 区分
 * @return {*}
 */
class Watcher {
  constructor(vm, cb) {
    this.id = id++;
    /**
     * 收集依赖的属性（dep）计算属性、组件卸载等地方会用
     */
    this.deps = [];
    this.depsIds = new Set();
    this.getter = cb; // getter 意味着调用这个函数可以发生取值操作
    this.get();
  }

  get() {
    // Dep 的静态变量
    Dep.target = this;
    this.getter();
    /**
     * 为什么要赋值 null
     * 在外部也会有取值的情况，同样会触发 get，赋值 null 可以保证仅在 watcher 里收集
     */
    Dep.target = null;
  }

  addDep(dep) {
    const id = dep.id;
    if (!this.depsIds.has(id)) {
      this.deps.push(dep);
      this.depsIds.add(id);
      dep.addSub(this);
    }
  }

  update() {
    console.log(`[watcher] update`)
    this.get();
  }
}

export default Watcher;

/**
 * 1. 创建 watcher 时 会把当前实例挂载在 Dep.target 上
 * 2. 调用 _render() 时，会取值，触发响应式的 get
 */
