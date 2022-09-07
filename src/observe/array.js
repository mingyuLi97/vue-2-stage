// 重写数组中的部分方法

let oldArrayProto = Array.prototype;

let newArrayProto = Object.create(oldArrayProto);

const methods = [
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice",
];

methods.forEach((method) => {
  newArrayProto[method] = function (...args) {
    const result = oldArrayProto[method].apply(this, args);

    const ob = this.__ob__;
    // 劫持数组新增的内容
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }

    if (inserted) {
      ob.observeArray(inserted);
    }

    console.log(`[array] 劫持了数组的方法`);
    ob.dep.notify();
    return result;
  };
});

export { newArrayProto };
