const inBrowser = typeof window !== "undefined";

if (inBrowser) {
  window["createHelper"] = createHelper;
}
// TODO: 1. abstract mode support

export default function createHelper(config) {
  const isDef = function (v) {
    return v !== undefined && v !== null;
  };
  if (config.Vue === undefined || config.router === undefined) {
    console.warn(
      "warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper"
    );
    return;
  }
  const Vue = config.Vue;
  const router = config.router;
  const mode = router.mode; // hash or history
  const replaceStay = config.replaceStay || [];
  let hacked = false;
  router._stack = 0;
  let pre = null;
  let isReplace = false;
  let replacePrePath;
  let preStateId = 0;
  let historyShouldChange = false;
  const historyStackMap = [];

  const stackPointer = () => router._stack;
  const setStackPointer = (val) => (router._stack = val);
  const increaseStackPointer = () => (router._stack += 1);
  const decreaseStackPointer = () => (router._stack -= 1);

  const PLACEHOLDER_VM = {
    __placeholder: true,
  };
  const resolvePushedVm = (currentVm) => {
    return !currentVm.$vnode.data.keepAlive ? PLACEHOLDER_VM : currentVm;
  };
  const isPlaceHolderVm = (vm) => !!vm.__placeholder;

  router.afterEach((to, from) => {
    historyShouldChange = true;
    // get the vm instance after render
    Vue.nextTick(() => {
      const current = getCurrentVM();
      const pendingToPushVm = resolvePushedVm(current);

      if (pre === null) {
        initialCb(pendingToPushVm);
      } else if (isReplace) {
        replaceCb(pendingToPushVm);
      } else if (isPush()) {
        pushCb(pendingToPushVm);
      } else {
        backCb(pendingToPushVm);
      }

      pre = current;
      preStateId = stackPointer();
      if (!isPlaceHolderVm(pendingToPushVm)) {
        setCurrentVnodeKey();
        if (!hacked && current) {
          hackKeepAliveRender(current.$vnode.parent.componentInstance);
        }
        historyShouldChange = false;
      }
    });
  });
  /** ********  callback functions ************/
  const initialCb = function (vm) {
    const currentStateId = getStateId();

    if (isDef(currentStateId)) {
      setStackPointer(currentStateId);
    } else {
      setState(0);
    }

    pushStack(vm);
  };
  const pushCb = function (vm) {
    setState(increaseStackPointer());
    pushStack(vm);
  };
  const backCb = function (vm) {
    (historyStackMap.pop() || []).forEach(
      (vm) => vm && vm.$keepAliveDestroy && vm.$keepAliveDestroy()
    );
    decreaseStackPointer();
    pushStack(vm);
  };
  const replaceCb = function (vm) {
    if (
      !(isDef(replacePrePath) && replaceStay.indexOf(replacePrePath) !== -1)
    ) {
      pre.$keepAliveDestroy();
    }
    setState(stackPointer());
    pushStack(vm);
    isReplace = false;
    replacePrePath = undefined;
  };
  /** ********* hack keep alive render *******************/

  const hackKeepAliveRender = function (vm) {
    // modify the first keep alive key and catch
    replaceFirstKeyAndCache(vm, genKey(stackPointer()));

    const tmp = vm.$options.render;
    vm.$options.render = function () {
      const slot = this.$slots.default;
      const vnode = getFirstComponentChild(slot); // vnode is a keep-alive-component-vnode
      if (historyShouldChange) {
        if (vnode && !isDef(vnode.key)) {
          if (isReplace) {
            vnode.key = genKey(stackPointer());
          } else if (isPush()) {
            vnode.key = genKey(stackPointer() + 1);
          } else {
            vnode.key = genKey(stackPointer() - 1);
          }
        }
      } else {
        // when historyShouldChange is false should rerender only, should not create new vm ,use the same vnode.key issue#7
        vnode.key = genKey(stackPointer());
      }
      return tmp.apply(this, arguments);
    };
    hacked = true;
  };

  /** ************* stack map helper **************/
  const pushStack = function (vm) {
    const cur = stackPointer();
    const stack = historyStackMap[cur];
    if (Array.isArray(stack)) {
      !stack.includes(vm) && stack.push(vm);
      historyStackMap[cur] = stack.filter((item) => !item._isDestroyed);
    } else {
      const vms = [];
      vms.push(vm);
      historyStackMap[cur] = vms;
    }
  };

  /** ********* router helper ************/
  const getStateId = function () {
    const state = getCurrentState();
    return isDef(state) ? state.id : undefined;
  };
  const setState = function (id) {
    // optimize file:// URL
    let path =
      window.location.pathname + (mode === "hash" ? window.location.hash : "");
    if (window.location.href.startsWith("file://")) {
      let pre;
      if (mode === "hash") {
        pre = window.location.href.split("#")[0];
      } else {
        pre = `${window.location.href.splice(".html")[0]}.html`;
      }
      path = pre + path;
    }
    let query = getQuery(router.history.current.query);
    path = path + query;
    let state = isDef(history.state) ? history.state : {};
    state["id"] = id;
    setStackPointer(id);
    history.replaceState(state, "", path);
  };
  const getQuery = function (params) {
    let query = "";
    query = Object.keys(params)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
    if (query.length > 0) {
      query = `?${query}`;
    }
    return query;
  };
  const getCurrentState = function () {
    return history.state;
  };
  const isPush = function () {
    if (!isReplace) {
      const stateId = getStateId();
      return !isDef(stateId) || preStateId <= stateId;
    }
    return false;
  };
  const genKey = function (num) {
    return `keep-alive-vnode-key${Number(num)}${router.history.current.path}`;
  };
  const getCurrentVM = function () {
    return router.history.current.matched.length > 0
      ? router.history.current.matched[0].instances.default
      : undefined;
  };
  const setCurrentVnodeKey = function () {
    const current = getCurrentVM();
    if (current && current._vnode) {
      // current._vnode.key = genVNodeKey(router._stack)
      current._vnode.parent.key = genKey(router._stack);
    }
  };

  /** ******************hack history replaceState function*******************/
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

  /** *********************** hack router.replace function ********** **/
  const rtmp = router.replace;
  router.replace = function (location, onComplete, onAbort) {
    isReplace = true;
    replacePrePath = router.history.current.path;
    rtmp.call(router, location, onComplete, (e) => {
      isReplace = false;
      replacePrePath = undefined;
      isDef(onAbort) && onAbort(e);
    });
  };
  /** ******************hack router go and push functions***************** **/
  const gstmp = router.go;
  router.go = function (number) {
    isReplace = false;
    return gstmp.call(router, number);
  };
  const pstmp = router.push;
  router.push = function (location, onComplete, onAbort) {
    isReplace = false;
    if (!onComplete && !onAbort && typeof Promise !== "undefined") {
      return pstmp.call(router, location, onComplete, onAbort);
    } else {
      pstmp.call(router, location, onComplete, onAbort);
    }
  };
  /** ******** depend functions ************/
  // add $keepAliveDestroy function to every vm instance instand of $destroy function
  // remove vnode in cache vnodes when destroy a keep-alive instance,
  // just in case reuse previous vm instance of this vnode when push to the same page second time
  const replaceFirstKeyAndCache = function (vm, key) {
    if (!isDef(vm) || !isDef(vm.cache) || !isDef(vm.keys)) {
      return;
    }
    const keys = vm.keys;
    const cache = vm.cache;
    if (keys.length === 1) {
      const vnode = cache[keys[0]];
      delete cache[keys[0]];
      keys.splice(0, 1);
      keys.push(key);
      cache[key] = vnode;
    }
  };

  const dtmp = Vue.prototype.$destroy;

  /**
   * @this Vue
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

  // getFirstChild
  const getFirstComponentChild = function (children) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c;
        }
      }
    }
  };
  const isAsyncPlaceholder = function (node) {
    return node.isComment && node.asyncFactory;
  };
}
