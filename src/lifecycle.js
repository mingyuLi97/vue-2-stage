import { createElementVNode, createTextVNode } from "./vdom";

/**
 * 创建真实 dom
 * @param {*} vnode
 * @return {HTMLElement}
 */
function createElement(vnode) {
  const { tag, data, children, text } = vnode;
  // 判断是标签
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElement(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

/**
 * @description: 更新属性
 * @param {HTMLElement} el
 * @param {Object} props
 * @return {*}
 */
function patchProps(el, props) {
  for (let key in props) {
    if (key === "style") {
      for (let name in props.style) {
        el.style[name] = props.style[name];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    /**
     * @type {Node}
     */
    const el = oldVNode;
    const parentEl = el.parentNode;
    const newEl = createElement(vnode);
    console.log(`[lifecycle] newEl`, newEl);
    parentEl.insertBefore(newEl, el.nextSibling);
    parentEl.removeChild(el);
    return newEl;
  } else {
    // diff
  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    console.log(`[lifecycle] update`, vnode, vm);
    // 初始化/更新 真实 dom
    vm.$el = patch(vm.$el, vnode);
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

  /**
   * 创建虚拟 dom
   * @return {*} 返回虚拟 dom
   */
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
  // 1. render 函数生成虚拟dom
  // 2. 根据虚拟 dom 生成真实 dom
  // 3. 插入到 el
  vm.$el = el;

  vm._update(vm._render());
}

// vue 流程

/**
 * 1. 创建响应式数据
 * 2. 模版转换成 ast
 * 3. ast 转换成 render 函数
 * 4. 每次数据更新 直接调用 render 函数，无需再次执行 ast 转换
 */
