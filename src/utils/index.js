import { LIFECYCLE_HOOKS } from "../shared/index";
/**
 * 合并 options
 * TODO
 */
export function mergeOptions(parent, child) {
  const opts = {};
  function mergeField(k) {
    // 为了实现 mixin，将生命周期钩子转换成数组
    if (LIFECYCLE_HOOKS.includes(k)) {
      opts[k] = [child[k] || parent[k]];
    } else {
      opts[k] = child[k] || parent[k];
    }
  }

  for (let key in parent) {
    mergeField(key);
  }
  for (let key in child) {
    mergeField(key);
  }
  return opts;
}
