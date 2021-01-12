const inBrowser = typeof window !== 'undefined'

if(inBrowser){
  window.createHelper = createHelper;
}

export default function createHelper(config) {

  if(config.Vue === undefined || config.router === undefined){
    console.warn("warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper")
    return;
  }
  const Vue = config.Vue;
  const router = config.router;
  const canRefresh = config.canRefresh === undefined ? true : config.canRefresh;
  // When 'canRefresh === true' ,RouterStack will make the stack visible in the query of URL path,
  // Because when a page can refresh , the vm._stack chain is broken.
  // The query.routerStack will be used as place B to keep the stack chain
  router._stack = 0;
  let pre;
  let isReplace = false;

  router.beforeEach((to, from, next) => {
    pre = getCurrentVM();
    next();
  })

  router.afterEach((to, from) => {
    // get the vm instance after render
    Vue.nextTick(() => {
      if (pre === undefined) {
        initialCb(to);
      } else if (isReplace) {
        replaceCb();
        console.log("replace")
      } else if (isPush(to)) {
        pushCb();
        console.log("push")
      } else {
        backCb();
        console.log("back")
      }
      setCurrentVnodeKey();
      const current = getCurrentVM();
      console.log(current.$vnode.parent.componentInstance.cache);
      console.log(current.$vnode.parent.componentInstance.keys);
    })
  })

  // hack router.replace function
  const rtmp = router.replace;
  router.replace = function(arg, complete, abort) {
    isReplace = true;
    rtmp.apply(router, [arguments[0]]);
  }

  // hack the router.push , canRefresh mode only
  if (canRefresh) {
    const ptmp = router.push;
    router.push = function(arg, complete, abort) {
      if (canRefresh) {
        const current = getCurrentVM()
        if (typeof arg === 'string') {
          arg = arg.indexOf('?') !== -1 ? arg + `&routerStack=${current._stack + 1}` : arg + `?routerStack=${current._stack + 1}`
        } else {
          if (!arg.query) {
            arg.query = { 'routerStack': current._stack + 1 }
          } else {
            arg.query['routerStack'] = current._stack + 1;
          }
        }
      }
      ptmp.apply(router, [arguments[0]])
    }
  }

  /** ********* router helper ************/

  const getCurrentVM = function() {
    return router.history.current.matched.length > 0 ? router.history.current.matched[0].instances.default : undefined;
  }
  const getCurrentVMStack = function() {
    return getCurrentVM() ? getCurrentVM()._stack : undefined;
  }
  const setCurrentVMStack = function(stack) {
    router.history.current.matched.length > 0 && (router.history.current.matched[0].instances.default._stack = Number(stack));
  }
  const setCurrentVnodeKey = function() {
    const current = getCurrentVM();
    // console.log(current._vnode)
    if (current && current._vnode) { 
      current._vnode.key = Number(current._stack) + router.history.current.path 
      current._vnode.parent.key = "keep-alive"+ current._vnode.key
    }
  }
  /** ********  callback functions ************/
  const initialCb = function(to) {
    if (canRefresh) {
      if (to.query && to.query.routerStack !== undefined) {
        setCurrentVMStack(to.query.routerStack);
        router._stack = to.query.routerStack;
      } else {
        setCurrentVMStack(0);
      }
    } else {
      setCurrentVMStack(0);
    }
  }
  const pushCb = function() {
    router._stack++;
    setCurrentVMStack(router._stack)
  }
  const backCb = function() {
    router._stack--;
    if (getCurrentVMStack() === undefined) {
      setCurrentVMStack(pre._stack - 1)
    }
    pre.$keepAliveDestroy();
  }
  const replaceCb = function() {
    setCurrentVMStack(pre._stack)
    pre.$keepAliveDestroy();
    isReplace = false;
  }
  const isPush = function(to) {
    // in normal , getCurrentVMStack is undefined only happened when push,
    // But when refresh mode, getCurrentVMStack is undefined can also happened when popback
    // In this case , the query.routerStack will be used instand of vm._stack

    return true;
    const toStack = to.query ? to.query.routerStack !== undefined ? to.query.routerStack : 0 : 0;
    return (getCurrentVMStack() === undefined && !canRefresh) || (canRefresh && toStack > pre._stack);
  }

  /** ******** depend functions ************/
  // add $keepAliveDestroy function to every vm instance instand of $destroy function
  // remove vnode in cache vnodes when destroy a keep-alive instance,
  // just in case reuse previous vm instance of this vnode when push to the same page second time
  const dtmp = Vue.prototype.$destroy;
  const f = function() {
    if (this.$vnode && this.$vnode.data.keepAlive) {
      if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
        if (this.$vnode.componentOptions) {
          var key = this.$vnode.key == null
            ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '')
            : this.$vnode.key;
          var cache = this.$vnode.parent.componentInstance.cache;
          var keys = this.$vnode.parent.componentInstance.keys;
          if (cache[key]) {
            if (keys.length) {
              var index = keys.indexOf(key);
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
  }
  Vue.prototype.$keepAliveDestroy = f;
}