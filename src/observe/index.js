import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
  constructor(data) {
    // Object.defineProperty 只能劫持存在的属性，新增的 删除的检测不到

    // 将当前对象的实例挂载到 data 上，为了 在 array.js 文件中重写方法时 能调用到 ob 的方法
    // data.__ob__ = this; 不能这样写，因为在遍历对象的时候会死循环
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });

    // 数组很少用下标的方式来修改，而这样遍历劫持又回很浪费性能，所以不对数组下标劫持
    if (Array.isArray(data)) {
      /**
       * 一般对数组操作用 push、shift、等 7个方法。
       * 我们可以重写这些方法，保留其他方法
       */
      data.__proto__ = newArrayProto;

      this.observeArray(data); // 数组中的对象也要被监测
    } else {
      this.walk(data);
    }
  }

  walk(data) {
    // ”重新定义“ 属性 vue2 的性能瓶颈
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }

  observeArray(arr) {
    arr.forEach((item) => observe(item));
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
  const dep = new Dep();
  // 闭包 会将 val 存在 defineReactive 这个作用域里
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      // 当重新赋值时，新值也要进行劫持
      observe(newVal);
      val = newVal;
      dep.notify();
    },
  });
}

export function observe(data) {
  // 仅仅对对象进行劫持
  if (data === null || typeof data !== "object") {
    return;
  }

  // 被监测过的不在监听
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }

  return new Observer(data);
}
