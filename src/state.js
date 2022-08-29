import { observe } from "./observe/index";

function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
}

// 代理取值 vm.name => vm._data.name
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(nv) {
      vm[target][key] = nv;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;

  // vue 根实例的 data 可以是对象、函数。 组件里的 data 必须是函数
  data = typeof data === "function" ? data.call(vm) : data;

  vm._data = data;

  // 数据劫持 defineProperty
  observe(data);

  for (const key in data) {
    proxy(vm, "_data", key);
  }
}

export { initState };
