import { parseHTML } from "./parse";
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ aaa }} 匹配到表达式变量

function genProps(attrs) {
  let str = "";
  attrs.forEach(({ name, value }) => {
    if (name === "style") {
      const obj = {};
      // color: "red"; top: 0; => 转换成 对象
      value.split(";").forEach((item) => {
        const [key, val] = item.split(":");
        obj[key] = val;
      });
      value = obj;
    }

    str += `${name}:${JSON.stringify(value)},`;
  });
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  if (node.type === 3) {
    return genCode(node);
  } else {
    console.log(node);
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 匹配 {{name}} hello {{age}} world
      // _v(_s(name) + "hello" + _s(age))
      const tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;

      while ((match = defaultTagRE.exec(text))) {
        let index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      console.log(`[index] tokens`, tokens);
      return `_v(${tokens.join("+")})`;
    }
  }
}

function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}

function genCode(ast) {
  const strProps = ast.attrs.length > 0 ? genProps(ast.attrs) : "undefined";
  const strChild = ast.children.length ? "," + genChildren(ast.children) : "";
  let code = `_c('${ast.tag}',${strProps}${strChild})`;

  return code;
}

export function compileToFunction(template) {
  // 1. 将 template 转换成 ast
  const ast = parseHTML(template);
  console.log("ast:", ast);
  // 2. 生成 render 方法(render 的返回值就是 虚拟 DOM)
  const code = genCode(ast);
  // _v(_s(name) + "hello" + _s(age)) 里面的 name age 等变量是找不到的 需要通过 with，让其去 this(vm) 寻找
  const render = new Function(`with(this){return ${code}}`);
  // console.log(`[index] render`, render.toString());
  return render;
}
