import { parseHTML } from "./parse";

export function compileToFunction(template) {
  // 1. 将 template 转换成 ast
  const ast = parseHTML(template);
  console.log("ast:", ast);
  // 2. 生成 render 方法(render 的返回值就是 虚拟 DOM)
}
