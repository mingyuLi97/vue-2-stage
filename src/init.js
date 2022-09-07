import { compileToFunction } from "./compiler/index";
import { callHooks, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils/index";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    // $ 开头的都认为是自己的属性，data 里设置 $name $age 会不生效
    const vm = this;
    // 将配置挂载到实例上 方便其他方法访问
    vm.$options = mergeOptions(options, {});

    callHooks(vm, "beforeCreate");
    initState(vm);
    callHooks(vm, "created");

    if (options.el) {
      vm.$mount(options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    const vm = this;
    const opts = vm.$options;
    el = document.querySelector(el);

    if (!opts.render) {
      let template;
      if (opts.template) {
        template = opts.template;
      } else {
        template = el.outerHTML;
      }
      console.log("template1: ", template);
      if (template) {
        opts.render = compileToFunction(template);
      }
    }
    console.log(opts.render);
    mountComponent(vm, el);
  };
}
