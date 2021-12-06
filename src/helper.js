import {
  getCurrentVM,
  isDef,
  getStateId,
  resolvePushedVm,
  genKey,
  replaceFirstKeyAndCache,
  getFirstComponentChild,
  isPlaceHolderVm,
  setCurrentVnodeKey,
  replaceState,
} from './utils';
import HistoryStack from './historyStack';

export default class VueRouterKeepAliveHelper {
  constructor({ Vue, router, replaceStay }) {
    this.Vue = Vue;
    this.router = router;
    this.router._stack = 0;
    this.mode = router.mode; // hash or history
    this.historyShouldChange = false;
    this.isReplace = false;
    this.replacePrePath = undefined;
    this.preStateId = 0;
    this.pre = null;
    this.replaceStay = replaceStay || [];
    this.hacked = false;
    this.historyStack = new HistoryStack();
    this.init();
  }
  init() {
    this.routerHooks();
    this.hackRouter();
  }
  /**
   * use afterEach hook to set state.key and add the reference of vm to the historyStack
   */
  routerHooks() {
    const router = this.router;
    router.afterEach((to, from) => {
      this.historyShouldChange = true;
      // get the vm instance after render
      this.Vue.nextTick(() => {
        const current = this.currentVm;
        const pendingToPushVm = resolvePushedVm(current);
        if (this.pre === null) {
          this.onInitial(pendingToPushVm);
        } else if (this.isReplace) {
          this.onReplace(pendingToPushVm);
        } else if (this.isPush) {
          this.onPush(pendingToPushVm);
        } else {
          this.onBack(pendingToPushVm);
        }
        // console.log(current)
        this.pre = current;
        this.preStateId = this.stackPointer;
        if (!isPlaceHolderVm(pendingToPushVm)) {
          setCurrentVnodeKey(router, genKey(this.stackPointer, router));
          if (!this.hacked && current) {
            this.hackKeepAliveRender(current.$vnode.parent.componentInstance);
          }
          this.historyShouldChange = false;
        }
      });
    });
  }
  /**
   * @description hack router go , replace and push functions to tell replace from back and push
   */
  hackRouter() {
    const router = this.router;
    const rtmp = router.replace;
    const rtmpf = (location, onComplete, onAbort) => {
      this.isReplace = true;
      this.replacePrePath = router.history.current.path;
      rtmp.call(router, location, onComplete, (e) => {
        this.isReplace = false;
        this.replacePrePath = undefined;
        isDef(onAbort) && onAbort(e);
      });
    };
    router.replace = function (location, onComplete, onAbort) {
      rtmpf(location, onComplete, onAbort);
    };

    const gstmp = router.go;
    const gstmpf = (number) => {
      this.isReplace = false;
      return gstmp.call(router, number);
    };
    router.go = function (num) {
      return gstmpf(num);
    };
    const pstmp = router.push;
    const pstmpf = (location, onComplete, onAbort) => {
      this.isReplace = false;
      if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
        return pstmp.call(router, location, onComplete, onAbort);
      } else {
        pstmp.call(router, location, onComplete, onAbort);
      }
    };
    router.push = function (location, onComplete, onAbort) {
      return pstmpf(location, onComplete, onAbort);
    };
  }
  /**
   * @description hack the render function of keep-alive component, modify the key of vnode for cache
   * @param {*} vm keep-alive component instance
   */
  hackKeepAliveRender(vm) {
    // modify the first keep alive key and cache
    replaceFirstKeyAndCache(vm, genKey(this.stackPointer, this.router));

    const tmp = vm.$options.render;
    const self = this;
    const router = this.router;
    vm.$options.render = function () {
      const slot = this.$slots.default;
      const vnode = getFirstComponentChild(slot); // vnode is a keep-alive-component-vnode
      if (self.historyShouldChange) {
        if (vnode && !isDef(vnode.key)) {
          if (self.isReplace) {
            vnode.key = genKey(self.stackPointer, router);
          } else if (self.isPush) {
            vnode.key = genKey(self.stackPointer + 1, router);
          } else {
            vnode.key = genKey(self.stackPointer - 1, router);
          }
        }
      } else {
        // when historyShouldChange is false should rerender only, should not create new vm ,use the same vnode.key issue#7
        vnode.key = genKey(self.stackPointer, router);
      }
      return tmp.apply(this, arguments);
    };
    this.hacked = true;
  }
  /** ********  callback functions ************/
  onInitial(vm) {
    const currentStateId = getStateId();
    if (isDef(currentStateId)) {
      this.setStackPointer(currentStateId);
    } else {
      this.setState(0);
    }
    this.historyStack.push(vm, this.stackPointer);
  }
  onPush(vm) {
    this.setState(this.increaseStackPointer());
    this.historyStack.push(vm, this.stackPointer);
    this.pre?.$clearParent?.(vm);
    this.pre = null;
  }
  onBack(vm) {
    this.historyStack.pop(vm);
    this.decreaseStackPointer();
    this.historyStack.push(vm, this.stackPointer);
  }
  onReplace(vm) {
    // avoidReplaceQuery is fix the issue : router.replace only a query by same path, may cause error
    const avoidReplaceQuery = this.replacePrePath === this.router.history.current.path
    const shouldDestroy = !(
      isDef(this.replacePrePath) &&
      this.replaceStay.includes(this.replacePrePath)) && 
      !avoidReplaceQuery

    if (shouldDestroy) {
      this.pre?.$keepAliveDestroy?.(vm);
    } else if (!avoidReplaceQuery) {
      this.pre?.$clearParent?.(vm);
    }
    
    this.pre = null;
    this.setState(this.stackPointer);
    this.historyStack.push(vm, this.stackPointer);
    this.isReplace = false;
    this.replacePrePath = undefined;
  }
  get currentVm() {
    return getCurrentVM(this.router);
  }
  get isPush() {
    if (!this.isReplace) {
      const stateId = getStateId();
      return !isDef(stateId) || this.preStateId <= stateId;
    }
    return false;
  }
  get stackPointer() {
    return this.router._stack;
  }
  setState(id) {
    this.setStackPointer(id);
    replaceState(this.mode, this.router, id);
  }
  setStackPointer(val) {
    this.router._stack = val;
  }
  increaseStackPointer() {
    return (this.router._stack += 1);
  }
  decreaseStackPointer() {
    return (this.router._stack -= 1);
  }
}
