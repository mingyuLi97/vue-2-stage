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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配开始标签 [1] 为标签的名字

  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));

  /**
   * 匹配到一个删除一个，直到没有
   * 参考：https://www.npmjs.com/package/htmlparser2
   * @param {*} html
   * @return {*}
   */

  function parseHTML(html) {
    var ELEMENT_TYPE = 3;
    var TEXT_TYPE = 1;
    var stack = []; // 用于存放元素，从而构建抽象语法树 （栈的最后一个元素就是下一个元素的父元素）

    var currentParent; // 指向栈的最后一个

    var root;

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } // 前进，删除匹配过的数据


    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // console.log(`[index] start match`, match, html);
        // 如果不是结束标签就一直匹配下去

        var attr = html.match(attribute);
        var end = html.match(startTagClose);

        while (!end && attr) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          advance(attr[0].length);
          end = html.match(startTagClose);
          attr = html.match(attribute);
        } // 删除结束标签


        if (end) {
          advance(end[0].length);
        }

        return match;
      }

      return false;
    }

    function handleStart(tag, attrs) {
      var node = createASTElement(tag, attrs); // 检查树的根节点

      if (!root) {
        root = node;
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node;
    } // 文本节点直接放到当前指向的节点


    function handleText(content) {
      var text = content.replace(/\s/g, "");
      if (!text) return;
      var node = {
        text: text,
        type: TEXT_TYPE,
        parent: currentParent
      };
      currentParent.children.push(node);
    }

    function handleEnd(tag) {
      var node = stack.pop();

      if (node.tag !== tag) {
        throw Error("tag 不匹配 ");
      }

      currentParent = stack[stack.length - 1];
    } // html 的开始肯定是 < 符号


    while (html) {
      /**
       * <div>111</div>
       * 如果值为 0：标签的开始
       * 不为0: 文本的结束位置 （111）
       */
      var textEnd = html.indexOf("<");

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          handleStart(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          handleEnd(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        } // break;

      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd);

        if (text) {
          handleText(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ aaa }} 匹配到表达式变量

  function genProps(attrs) {
    var str = "";
    attrs.forEach(function (_ref) {
      var name = _ref.name,
          value = _ref.value;

      if (name === "style") {
        var obj = {}; // color: "red"; top: 0; => 转换成 对象

        value.split(";").forEach(function (item) {
          var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              val = _item$split2[1];

          obj[key.trim()] = val.trim();
        });
        value = obj;
      }

      str += "".concat(name, ":").concat(JSON.stringify(value), ",");
    });
    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 3) {
      return genCode(node);
    } else {
      console.log(node);
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 匹配 {{name}} hello {{age}} world
        // _v(_s(name) + "hello" + _s(age))
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        console.log("[index] tokens", tokens);
        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }

  function genCode(ast) {
    var strProps = ast.attrs.length > 0 ? genProps(ast.attrs) : "undefined";
    var strChild = ast.children.length ? "," + genChildren(ast.children) : "";
    var code = "_c('".concat(ast.tag, "',").concat(strProps).concat(strChild, ")");
    return code;
  }

  function compileToFunction(template) {
    // 1. 将 template 转换成 ast
    var ast = parseHTML(template);
    console.log("ast:", ast); // 2. 生成 render 方法(render 的返回值就是 虚拟 DOM)

    var code = genCode(ast); // _v(_s(name) + "hello" + _s(age)) 里面的 name age 等变量是找不到的 需要通过 with，让其去 this(vm) 寻找

    var render = new Function("with(this){return ".concat(code, "}")); // console.log(`[index] render`, render.toString());

    return render;
  }

  var id$1 = 0;
  /**
   *
   */

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 存放 watcher

      this.subs = [];
    }
    /**
     * 依赖收集
     * 不希望取到重复的 watcher，所以使用 addSub 方法来替代 this.subs.push
     * addSub 是在 watcher 里调用、去重
     */


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // this.subs.push(Dep.target);
        Dep.target.addDep(this);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }]);

    return Dep;
  }();

  Dep.target = null;

  var id = 0;
  /**
   * 不同组件会有不同的 watcher 实例，通过 id 区分
   * @return {*}
   */

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      /**
       * 收集依赖的属性（dep）计算属性、组件卸载等地方会用
       */

      this.deps = [];
      this.depsIds = new Set();
      this.getter = cb; // getter 意味着调用这个函数可以发生取值操作

      this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // Dep 的静态变量
        Dep.target = this;
        this.getter();
        /**
         * 为什么要赋值 null
         * 在外部也会有取值的情况，同样会触发 get，赋值 null 可以保证仅在 watcher 里收集
         */

        Dep.target = null;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsIds.has(id)) {
          this.deps.push(dep);
          this.depsIds.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        console.log("[watcher] update");
        this.get();
      }
    }]);

    return Watcher;
  }();
  /**
   * 1. 创建 watcher 时 会把当前实例挂载在 Dep.target 上
   * 2. 调用 _render() 时，会取值，触发响应式的 get
   */

  // _c()
  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v()

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  /**
   * 创建真实 dom
   * @param {*} vnode
   * @return {HTMLElement}
   */

  function createElement(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text; // 判断是标签

    if (typeof tag === "string") {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, data);
      children.forEach(function (child) {
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
    for (var key in props) {
      if (key === "style") {
        for (var name in props.style) {
          el.style[name] = props.style[name];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }

  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      /**
       * @type {Node}
       */
      var el = oldVNode;
      var parentEl = el.parentNode;
      var newEl = createElement(vnode);
      console.log("[lifecycle] newEl", newEl);
      parentEl.insertBefore(newEl, el.nextSibling);
      parentEl.removeChild(el);
      return newEl;
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      console.log("[lifecycle] update", vnode, vm); // 初始化/更新 真实 dom

      vm.$el = patch(vm.$el, vnode);
    }; // _c('div', {}, ...children)


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v(text)


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (val) {
      if (_typeof(val) !== "object") return val;
      return JSON.stringify(val);
    };
    /**
     * 创建虚拟 dom
     * @return {*} 返回虚拟 dom
     */


    Vue.prototype._render = function () {
      console.log("[lifecycle] render");
      var vm = this;
      /**
       * ast 生成的 render
       * 渲染时会去 vm 上取值，以达成数据和视图绑定到一起
       */

      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    // 1. render 函数生成虚拟dom
    // 2. 根据虚拟 dom 生成真实 dom
    // 3. 插入到 el
    vm.$el = el;

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    console.log(new Watcher(vm, updateComponent));
  } // vue 流程

  /**
   * 1. 创建响应式数据
   * 2. 模版转换成 ast
   * 3. ast 转换成 render 函数
   * 4. 每次数据更新 直接调用 render 函数，无需再次执行 ast 转换
   */

  // 重写数组中的部分方法
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayProto[method].apply(this, args);
      var ob = this.__ob__; // 劫持数组新增的内容

      var inserted;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) {
        ob.observeArray(inserted);
      }

      console.log("[array] \u52AB\u6301\u4E86\u6570\u7EC4\u7684\u65B9\u6CD5");
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // Object.defineProperty 只能劫持存在的属性，新增的 删除的检测不到
      // 将当前对象的实例挂载到 data 上，为了 在 array.js 文件中重写方法时 能调用到 ob 的方法
      // data.__ob__ = this; 不能这样写，因为在遍历对象的时候会死循环
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      }); // 数组很少用下标的方式来修改，而这样遍历劫持又回很浪费性能，所以不对数组下标劫持

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

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // ”重新定义“ 属性 vue2 的性能瓶颈
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(arr) {
        arr.forEach(function (item) {
          return observe(item);
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
    observe(val);
    var dep = new Dep(); // 闭包 会将 val 存在 defineReactive 这个作用域里

    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend();
        }

        return val;
      },
      set: function set(newVal) {
        if (newVal === val) return; // 当重新赋值时，新值也要进行劫持

        observe(newVal);
        val = newVal;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 仅仅对对象进行劫持
    if (data === null || _typeof(data) !== "object") {
      return;
    } // 被监测过的不在监听


    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
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

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var opts = vm.$options;
      el = document.querySelector(el);

      if (!opts.render) {
        var template;

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

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
