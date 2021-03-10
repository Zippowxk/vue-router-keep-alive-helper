import { isDef } from "./utils";

export function extendHistory(history) {
  const rstmp = history.replaceState;
  history.replaceState = function (state, op, path) {
    const old = Object.assign({}, history.state);
    const s = Object.assign(old, state);
    rstmp.call(history, s, op, path);
  }
  const historyPushState = history.pushState;
  history.pushState = function (state, op, path) {
    const old = Object.assign({}, history.state);
    const s = Object.assign(old, state);
    historyPushState.call(history, s, op, path);
  }
}

export function extendVue(Vue) {
  const dtmp = Vue.prototype.$destroy;
  /**
   * @description remove the cache in <keep-alive> component before invoke $destroy
   */
  Vue.prototype.$keepAliveDestroy = function () {
    if (this.$vnode && this.$vnode.data.keepAlive) {
      if (
        this.$vnode.parent &&
        this.$vnode.parent.componentInstance &&
        this.$vnode.parent.componentInstance.cache
      ) {
        if (this.$vnode.componentOptions) {
          const key = !isDef(this.$vnode.key)
            ? this.$vnode.componentOptions.Ctor.cid +
              (this.$vnode.componentOptions.tag
                ? `::${this.$vnode.componentOptions.tag}`
                : "")
            : this.$vnode.key;
          const cache = this.$vnode.parent.componentInstance.cache;
          const keys = this.$vnode.parent.componentInstance.keys;
          if (cache[key]) {
            if (keys.length) {
              const index = keys.indexOf(key);
              if (index > -1) {
                keys.splice(index, 1);
              }
            }
            delete cache[key];
          }
        }
      }
    }
    dtmp.apply(this, arguments);
  };
}
