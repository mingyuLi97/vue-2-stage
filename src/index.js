import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);

Vue.prototype.$nextTick = nextTick;

export default Vue;
