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

          obj[key] = val;
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
    var strProps = ast.attrs.length > 0 ? genProps(ast.attrs) : "null";
    var strChild = ast.children.length ? "," + genChildren(ast.children) : "";
    var code = "_c('".concat(ast.tag, "',").concat(strProps).concat(strChild, ")");
    return code;
  }

  function compileToFunction(template) {
    // 1. 将 template 转换成 ast
    var ast = parseHTML(template);
    console.log("ast:", ast); // 2. 生成 render 方法(render 的返回值就是 虚拟 DOM)

    var code = genCode(ast);
    var render = new Function("with(this){return ".concat(code, "}")); // console.log(`[index] render`, render.toString());

    return render;
  }

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
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
