import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // $ 开头的都认为是自己的属性，data 里设置 $name $age 会不生效
    const vm = this;
    // 将配置挂载到实例上 方便其他方法访问
    vm.$options = options;

    initState(vm);
  };
}
