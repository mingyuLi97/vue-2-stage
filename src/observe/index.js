class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持存在的属性，新增的 删除的检测不到

    this.walk(data);
  }

  walk(data) {
    // ”重新定义“ 属性 vue2 的性能瓶颈
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
}
/**
 * 属性劫持
 * @param {*} target
 * @param {*} key
 * @param {*} val
 */
export function defineReactive(target, key, val) {
  // 递归深度劫持
  observe(val);
  // 闭包 会将 val 存在 defineReactive 这个作用域里
  Object.defineProperty(target, key, {
    get() {
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      // 当重新赋值时，新值也要进行劫持
      observe(newVal);
      val = newVal;
    },
  });
}

export function observe(data) {
  // 仅仅对对象进行劫持
  if (data === null || typeof data !== "object") {
    return;
  }

  return new Observer(data);
}
