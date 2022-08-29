(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // Object.defineProperty 只能劫持存在的属性，新增的 删除的检测不到
      this.walk(data);
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // ”重新定义“ 属性 vue2 的性能瓶颈
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();
  /**
   * 属性劫持
   * @param {*} target
   * @param {*} key
   * @param {*} val
   */


  function defineReactive(target, key, val) {
    // 递归深度劫持
    observe(val); // 闭包 会将 val 存在 defineReactive 这个作用域里

    Object.defineProperty(target, key, {
      get: function get() {
        return val;
      },
      set: function set(newVal) {
        if (newVal === val) return; // 当重新赋值时，新值也要进行劫持

        observe(newVal);
        val = newVal;
      }
    });
  }
  function observe(data) {
    // 仅仅对对象进行劫持
    if (data === null || _typeof(data) !== "object") {
      return;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  } // 代理取值 vm.name => vm._data.name


  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(nv) {
        vm[target][key] = nv;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // vue 根实例的 data 可以是对象、函数。 组件里的 data 必须是函数

    data = typeof data === "function" ? data.call(vm) : data;
    vm._data = data; // 数据劫持 defineProperty

    observe(data);

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // $ 开头的都认为是自己的属性，data 里设置 $name $age 会不生效
      var vm = this; // 将配置挂载到实例上 方便其他方法访问

      vm.$options = options;
      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
