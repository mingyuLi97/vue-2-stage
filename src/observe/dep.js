let id = 0;
/**
 *
 */
class Dep {
  constructor() {
    this.id = id++;
    // 存放 watcher
    this.subs = [];
  }

  /**
   * 依赖收集
   * 不希望取到重复的 watcher，所以使用 addSub 方法来替代 this.subs.push
   * addSub 是在 watcher 里调用、去重
   */
  depend() {
    // this.subs.push(Dep.target);
    Dep.target.addDep(this);
  }

  notify(){
    this.subs.forEach(watcher => watcher.update())
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }
}
Dep.target = null;

export default Dep;
