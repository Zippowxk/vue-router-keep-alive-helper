const inBrowser = typeof window !== 'undefined'

if (inBrowser) {
  window.createHelper = createHelper;
}
// TODO: 1. abstract mode support
export default function createHelper(config) {
  const isDef = function (v) {
    return v !== undefined && v !== null
  }
  if (config.Vue === undefined || config.router === undefined) {
    console.warn('warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper')
    return;
  }
  const Vue = config.Vue;
  const router = config.router;
  const mode = router.mode; // hash or history 
  const replaceStay = config.replaceStay || []
  let hacked = false;
  router._stack = 0;
  let pre;
  let isReplace = false;
  let replacePrePath;
  let preStateId = 0;
  let historyShouldChange = false;
  let historyStackMap = {};
  const publicPath = isDef(config.publicPath) ? config.publicPath : '';
  router.beforeEach((to, from, next) => {
    pre = getCurrentVM();
    next();
  })

  router.afterEach((to, from) => {
    historyShouldChange = true;
    // get the vm instance after render
    Vue.nextTick(() => {
      if (pre === undefined) {
        initialCb(to);
      } else if (isReplace) {
        replaceCb();
      } else if (isPush()) {
        pushCb();
      } else {
        backCb();
      }
      preStateId = Number(router._stack);
      setCurrentVnodeKey();
      const current = getCurrentVM();
      if (!hacked && current) {
        hackKeepAliveRender(current.$vnode.parent.componentInstance);
      }
      historyShouldChange = false;
    })
  })

  // hack router.replace function
  const rtmp = router.replace;
  router.replace = function(location, onComplete, onAbort) {
    isReplace = true;
    replacePrePath = router.history.current.path;
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        rtmp.call(router,location).then(()=>resolve()).catch(e=>{
          isReplace = false;
          replacePrePath = undefined;
          reject(e);
        });
      })
    } else {
      rtmp.call(router,location, onComplete, (e)=>{
        isReplace = false;
        replacePrePath = undefined;
        isDef(onAbort) && onAbort(e);
      })
    }
  }

  /** ********  callback functions ************/
  const initialCb = function(to) {
    if (isDef(getStateId())) {
      router._stack = getStateId();
    } else {
      setState(0);
    }
    pushStack(getCurrentVM());
  }
  const pushCb = function() {
    router._stack++;
    setState(router._stack)
    pushStack(getCurrentVM());
  }
  const backCb = function() {
    router._stack--;
    removeGreater(router._stack);
    pushStack(getCurrentVM());
  }
  const replaceCb = function() {
    if (!(isDef(replacePrePath) && replaceStay.indexOf(replacePrePath) !== -1)) {
      pre.$keepAliveDestroy();
    }
    setState(router._stack)
    pushStack(getCurrentVM());
    isReplace = false;
    replacePrePath = undefined;
  }
  /** ********* hack keep alive render *******************/

  const hackKeepAliveRender = function(vm) {
    // modify the first keep alive key and catch
    replaceFirstKeyAndCache(vm, genKey(router._stack))

    const tmp = vm.$options.render
    vm.$options.render = function() {
      const slot = this.$slots.default;
      const vnode = getFirstComponentChild(slot) // vnode is a keep-alive-component-vnode
      if (historyShouldChange) {
        if (!isDef(vnode.key)) {
          if (isReplace) {
            vnode.key = genKey(router._stack)
          } else if (isPush()) {
            vnode.key = genKey(Number(router._stack) + 1)
          } else {
            vnode.key = genKey(Number(router._stack) - 1)
          }
        }
      } else {
        // when historyShouldChange is false should rerender only, should not create new vm ,use the same vnode.key issue#7
        vnode.key = genKey(router._stack)
      }
      return tmp.apply(this, arguments)
    }
    hacked = true;
  }


  /*************** stack map helper **************/
  const pushStack = function(vm){
    const cur = router._stack;
    if(historyStackMap.hasOwnProperty(cur) && historyStackMap[cur]){
      const vms = historyStackMap[cur]
      vms.push(vm)
    }else{
      const vms = []
      vms.push(vm)
      historyStackMap[cur] = vms;
    }
  }
  const removeGreater = function(index){
    if(!isDef(historyStackMap) || historyStackMap.length<=0) {return}
    Object.keys(historyStackMap).forEach(level => {
      if (level<=index) {return}
      const vms = historyStackMap[level];
      if (!isDef(vms) || vms.length <=0 ){return}
      let vm = vms.pop();
      while (isDef(vm)) {
        vm.$keepAliveDestroy();
        vm = vms.pop();
      }
    });
  }

  /** ********* router helper ************/
  const getStateId = function () {
    const state = getCurrentState();
    return isDef(state) ? state.id : undefined
  }
  const setState = function(id) {
    // optimize file:// URL
    let path = (mode === 'hash' ? '#' : '') + publicPath + router.history.current.path;
    if (window.location.href.startsWith('file://')) {
      let pre;
      if (mode === 'hash') {
        pre = window.location.href.split('#')[0];
      } else {
        pre = window.location.href.splice('.html')[0] + '.html';
      }
      path = pre + path;
    }
    let query = getQuery(router.history.current.query)
    path = path + query;

    let state = isDef(history.state) ? history.state : {};
    state['id'] = id;
    history.replaceState(state, '', path)
  }
  const getQuery = function (params) {
    let query = ''
    query = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    if (query.length > 0) {
      query = '?' + query;
    }
    return query;
  }
  const getCurrentState = function() {
    return history.state
  }

  const isPush = function() {
    if (!isReplace) {
      return !isDef(getStateId()) || preStateId < getStateId()
    }
    return false;
  }

  const genKey = function(num) {
    return 'keep-alive-vnode-key' + Number(num) + router.history.current.path
  }
  const genVNodeKey = function(num) {
    return 'vnode-key' + Number(num) + router.history.current.path
  }
  const getCurrentVM = function() {
    return router.history.current.matched.length > 0 ? router.history.current.matched[0].instances.default : undefined;
  }
  const setCurrentVnodeKey = function() {
    const current = getCurrentVM();
    if (current && current._vnode) {
      current._vnode.key = genVNodeKey(router._stack)
      current._vnode.parent.key = genKey(router._stack)
    }
  }

  /********************hack history replaceState function*******************/
  const rstmp = history.replaceState;
  history.replaceState = function(state, op, path) {
    let s = Object.assign(history.state | {}, state)
    rstmp.call(history, s, op, path)
  }

  /** ******** depend functions ************/
  // add $keepAliveDestroy function to every vm instance instand of $destroy function
  // remove vnode in cache vnodes when destroy a keep-alive instance,
  // just in case reuse previous vm instance of this vnode when push to the same page second time
  const replaceFirstKeyAndCache = function(vm, key) {
    if (!isDef(vm) || !isDef(vm.cache) || !isDef(vm.keys)) { return }
    const keys = vm.keys;
    const cache = vm.cache;
    if (keys.length === 1) {
      const vnode = cache[keys[0]]
      delete cache[keys[0]]
      keys.splice(0, 1);
      keys.push(key);
      cache[key] = vnode;
    }
  }

  const dtmp = Vue.prototype.$destroy;
  const f = function() {
    if (this.$vnode && this.$vnode.data.keepAlive) {
      if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
        if (this.$vnode.componentOptions) {
          var key = !isDef(this.$vnode.key)
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

  // getFirstChild
  const getFirstComponentChild = function (children) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const c = children[i]
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }
  const isAsyncPlaceholder = function (node) {
    return node.isComment && node.asyncFactory
  }
}
