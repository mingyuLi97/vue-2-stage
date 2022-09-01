const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute =
  /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签 [1] 为标签的名字
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ aaa }} 匹配到表达式变量

/**
 * 匹配到一个删除一个，直到没有
 * 参考：https://www.npmjs.com/package/htmlparser2
 * @param {*} html
 * @return {*}
 */
export function parseHTML(html) {
  const ELEMENT_TYPE = 3;
  const TEXT_TYPE = 1;
  const stack = []; // 用于存放元素，从而构建抽象语法树 （栈的最后一个元素就是下一个元素的父元素）
  let currentParent; // 指向栈的最后一个
  let root;

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }

  // 前进，删除匹配过的数据
  function advance(n) {
    html = html.substring(n);
  }

  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // console.log(`[index] start match`, match, html);
      // 如果不是结束标签就一直匹配下去
      let attr = html.match(attribute);
      let end = html.match(startTagClose);

      while (!end && attr) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
        advance(attr[0].length);
        end = html.match(startTagClose);
        attr = html.match(attribute);
      }
      // 删除结束标签
      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false;
  }

  function handleStart(tag, attrs) {
    const node = createASTElement(tag, attrs);
    // 检查树的根节点
    if (!root) {
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }

    stack.push(node);
    currentParent = node;
  }

  // 文本节点直接放到当前指向的节点
  function handleText(content) {
    const text = content.replace(/\s/g, "");
    if (!text) return;
    const node = {
      text,
      type: TEXT_TYPE,
      parent: currentParent,
    };
    currentParent.children.push(node);
  }

  function handleEnd(tag) {
    const node = stack.pop();
    if (node.tag !== tag) {
      throw Error("tag 不匹配 ");
    }
    currentParent = stack[stack.length - 1];
  }

  // html 的开始肯定是 < 符号
  while (html) {
    /**
     * <div>111</div>
     * 如果值为 0：标签的开始
     * 不为0: 文本的结束位置 （111）
     */
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        handleStart(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }

      const endTagMatch = html.match(endTag);

      if (endTagMatch) {
        handleEnd(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
      // break;
    }

    if (textEnd > 0) {
      const text = html.substring(0, textEnd);
      if (text) {
        handleText(text);
        advance(text.length);
      }
    }
  }
  return root;
}
