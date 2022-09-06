import { createElementVNode, createTextVNode } from "./vdom";
export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    console.log(`[lifecycle] update`, vnode);
    // 初始化/更新 真实 dom
    patch();
  };

  // _c('div', {}, ...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  // _v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };

  Vue.prototype._s = function (val) {
    if (typeof val !== "object") return val;
    return JSON.stringify(val);
  };

  Vue.prototype._render = function () {
    console.log(`[lifecycle] render`);
    const vm = this;
    /**
     * ast 生成的 render
     * 渲染时会去 vm 上取值，以达成数据和视图绑定到一起
     */
    return vm.$options.render.call(vm);
  };
}

export function mountComponent(vm, el) {
  vm; // 1. render 函数生成虚拟dom
  // 2. 根据虚拟 dom 生成真实 dom
  // 3. 插入到 el

  vm._update(vm._render());
}

// vue 流程

/**
 * 1. 创建响应式数据
 * 2. 模版转换成 ast
 * 3. ast 转换成 render 函数
 * 4. 每次数据更新 直接调用 render 函数，无需再次执行 ast 转换
 */
