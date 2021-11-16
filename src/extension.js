import { isDef } from './utils';

export function extendHistory(history) {
  const rstmp = history.replaceState;
  history.replaceState = function (state, op, path) {
    const old = Object.assign({}, history.state);
    const s = Object.assign(old, state);
    rstmp.call(history, s, op, path);
  };
  const historyPushState = history.pushState;
  history.pushState = function (state, op, path) {
    const old = Object.assign({}, history.state);
    const s = Object.assign(old, state);
    historyPushState.call(history, s, op, path);
  };
}

export function extendVue(Vue) {
  const dtmp = Vue.prototype.$destroy;
  /**
   * @description remove the cache in <keep-alive> component before invoke $destroy
   */
  Vue.prototype.$keepAliveDestroy = function (vmCurrent) {
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
                : '')
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
            cache[key] = null;
            // fix memory leaks
            if (
              this.$vnode.parent && this.$vnode.parent.componentOptions && this.$vnode.parent.componentOptions.children &&
              Array.isArray(this.$vnode.parent.componentOptions.children)
            ) {
              this.$vnode.parent.componentOptions.children.length = 0
            }
            if (cache[vmCurrent.$vnode.key] && cache[vmCurrent.$vnode.key].parent && cache[vmCurrent.$vnode.key].parent.componentOptions) {
              cache[vmCurrent.$vnode.key].parent.componentOptions.children = [cache[vmCurrent.$vnode.key]]
              cache[vmCurrent.$vnode.key].parent.elm = cache[vmCurrent.$vnode.key].parent.componentInstance.$el
            }
            if (
              this.$parent.$children &&
              Array.isArray(this.$parent.$children)
            ) {
              const index = this.$parent.$children.indexOf(this);
              if (index >= 0) {
                this.$parent.$children.splice(index, 1);
              }
            }
          }
        }
      }
    }
    dtmp.apply(this, arguments);
  };
  Vue.prototype.$clearParent = function (vmCurrent) {
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
                : '')
            : this.$vnode.key;
          const cache = this.$vnode.parent.componentInstance.cache;
          if (cache[key]) {
            // fix memory leaks
            if (
              this.$vnode.parent && this.$vnode.parent.componentOptions && this.$vnode.parent.componentOptions.children &&
              Array.isArray(this.$vnode.parent.componentOptions.children)
            ) {
              this.$vnode.parent.componentOptions.children.length = 0
            }
            if (cache[vmCurrent.$vnode.key] && cache[vmCurrent.$vnode.key].parent && cache[vmCurrent.$vnode.key].parent.componentOptions) {
              cache[vmCurrent.$vnode.key].parent.componentOptions.children = [cache[vmCurrent.$vnode.key]]
              cache[vmCurrent.$vnode.key].parent.elm = cache[vmCurrent.$vnode.key].parent.componentInstance.$el
            }
            // if (
            //   this.$parent.$children &&
            //   Array.isArray(this.$parent.$children)
            // ) {
            //   const index = this.$parent.$children.indexOf(this);
            //   if (index >= 0) {
            //     this.$parent.$children.splice(index, 1);
            //   }
            // }
          }
        }
      }
    }
  };
}
