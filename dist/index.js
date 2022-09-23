(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.createHelper = factory());
}(this, (function () { 'use strict';

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var isDef = function isDef(v) {
    return v !== undefined && v !== null;
  };
  var PLACEHOLDER_VM = {
    __placeholder: true
  };
  var resolvePushedVm = function resolvePushedVm(currentVm) {
    return isDef(currentVm) && currentVm.$vnode.data.keepAlive ? currentVm : PLACEHOLDER_VM;
  };
  var isPlaceHolderVm = function isPlaceHolderVm(vm) {
    return vm && !!vm.__placeholder;
  };
  var getStateId = function getStateId() {
    var state = getCurrentState();
    return isDef(state) ? state.id : undefined;
  };

  var getCurrentState = function getCurrentState() {
    return history.state;
  };

  var genKey = function genKey(num, router) {
    return "keep-alive-vnode-key" + Number(num) + router.history.current.path;
  };
  var getCurrentVM = function getCurrentVM(router) {
    return router.history.current.matched.length > 0 ? router.history.current.matched[0].instances.default : undefined;
  };
  var setCurrentVnodeKey = function setCurrentVnodeKey(router, key) {
    var current = getCurrentVM(router);

    if (current && current._vnode) {
      current._vnode.parent.key = key;
    }
  };
  var replaceFirstKeyAndCache = function replaceFirstKeyAndCache(vm, key) {
    if (!isDef(vm) || !isDef(vm.cache) || !isDef(vm.keys)) {
      return;
    }

    var keys = vm.keys;
    var cache = vm.cache;

    if (keys.length === 1) {
      var vnode = cache[keys[0]];
      delete cache[keys[0]];
      keys.splice(0, 1);
      keys.push(key);
      cache[key] = vnode;
    }
  };
  var getFirstComponentChild = function getFirstComponentChild(children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];

        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c;
        }
      }
    }
  };
  var getRealChild = function getRealChild(vnode) {
    var compOptions = vnode && vnode.componentOptions;

    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children));
    } else {
      return vnode;
    }
  };

  var isAsyncPlaceholder = function isAsyncPlaceholder(node) {
    return node.isComment && node.asyncFactory;
  };

  var replaceState = function replaceState(mode, router, id) {
    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
    var path = "" + pathname + search + hash;
    var state = isDef(history.state) ? history.state : {};
    state['id'] = id; // optimize file:// URL

    var isFilSys = window.location.href.startsWith('file://');
    history.replaceState(state, '', isFilSys ? null : path);
  };
  var inBrowser = typeof window !== 'undefined';

  var HistoryStack = /*#__PURE__*/function () {
    function HistoryStack() {
      this.historyStackMap = [];
    }

    var _proto = HistoryStack.prototype;

    _proto.push = function push(vm, index) {
      // const cur = stackPointer();
      var stack = this.historyStackMap[index];

      if (Array.isArray(stack)) {
        !stack.includes(vm) && stack.push(vm);
        this.historyStackMap[index] = stack.filter(function (item) {
          return !item._isDestroyed;
        });
      } else {
        var vms = [];
        vms.push(vm);
        this.historyStackMap[index] = vms;
      }
    };

    _proto.pop = function pop(vmCurrent) {
      var last = this.historyStackMap.pop();
      Array.isArray(last) && last.forEach(function (vm) {
        return vm && vm.$keepAliveDestroy && vm.$keepAliveDestroy(vmCurrent);
      });
    };

    _proto.removeGreater = function removeGreater(index) {
      while (this.historyStackMap.length >= index) {
        this.pop();
      }
    };

    _proto.clear = function clear() {
      this.historyStackMap = [];
    };

    return HistoryStack;
  }();

  var VueRouterKeepAliveHelper = /*#__PURE__*/function () {
    function VueRouterKeepAliveHelper(_ref) {
      var Vue = _ref.Vue,
          router = _ref.router,
          replaceStay = _ref.replaceStay;
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

    var _proto = VueRouterKeepAliveHelper.prototype;

    _proto.init = function init() {
      this.routerHooks();
      this.hackRouter();
    }
    /**
     * use afterEach hook to set state.key and add the reference of vm to the historyStack
     */
    ;

    _proto.routerHooks = function routerHooks() {
      var _this = this;

      var router = this.router;
      router.afterEach(function (to, from) {
        _this.historyShouldChange = true; // get the vm instance after render

        _this.Vue.nextTick(function () {
          var current = _this.currentVm;
          var pendingToPushVm = resolvePushedVm(current);

          if (_this.pre === null) {
            _this.onInitial(pendingToPushVm);
          } else if (_this.isReplace) {
            _this.onReplace(pendingToPushVm);
          } else if (_this.isPush) {
            _this.onPush(pendingToPushVm);
          } else {
            _this.onBack(pendingToPushVm);
          } // console.log(current)


          _this.pre = current;
          _this.preStateId = _this.stackPointer;

          if (!isPlaceHolderVm(pendingToPushVm)) {
            setCurrentVnodeKey(router, genKey(_this.stackPointer, router));

            if (!_this.hacked && current) {
              var _current$$vnode$paren, _current$$vnode$paren2, _current$$vnode$paren3;

              _this.hackKeepAliveRender(current.$vnode.parent.componentInstance);

              console.log(current.$vnode.parent);

              if (((_current$$vnode$paren = current.$vnode.parent) == null ? void 0 : (_current$$vnode$paren2 = _current$$vnode$paren.parent) == null ? void 0 : (_current$$vnode$paren3 = _current$$vnode$paren2.componentOptions) == null ? void 0 : _current$$vnode$paren3.tag) === 'transition') {
                console.log('!!!!!!!!!!!'); // this.hackTransitionRender(current.$vnode.parent?.parent.componentInstance);
              }
            }

            _this.historyShouldChange = false;
          }
        });
      });
    }
    /**
     * @description hack router go , replace and push functions to tell replace from back and push
     */
    ;

    _proto.hackRouter = function hackRouter() {
      var _this2 = this;

      var router = this.router;
      var rtmp = router.replace;

      var rtmpf = function rtmpf(location, onComplete, onAbort) {
        _this2.isReplace = true;
        _this2.replacePrePath = router.history.current.path;
        rtmp.call(router, location, onComplete, function (e) {
          _this2.isReplace = false;
          _this2.replacePrePath = undefined;
          isDef(onAbort) && onAbort(e);
        });
      };

      router.replace = function (location, onComplete, onAbort) {
        rtmpf(location, onComplete, onAbort);
      };

      var gstmp = router.go;

      var gstmpf = function gstmpf(number) {
        _this2.isReplace = false;
        return gstmp.call(router, number);
      };

      router.go = function (num) {
        return gstmpf(num);
      };

      var pstmp = router.push;

      var pstmpf = function pstmpf(location, onComplete, onAbort) {
        _this2.isReplace = false;

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
    ;

    _proto.hackKeepAliveRender = function hackKeepAliveRender(vm) {
      // modify the first keep alive key and cache
      replaceFirstKeyAndCache(vm, genKey(this.stackPointer, this.router));
      var tmp = vm.$options.render;
      var self = this;
      var router = this.router;

      vm.$options.render = function () {
        var slot = this.$slots.default;
        var vnode = getRealChild(slot); // vnode is a keep-alive-component-vnode

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
    };

    _proto.hackTransitionRender = function hackTransitionRender(vm) {
      var tmp = vm.$options.render;
      var self = this;
      var router = this.router;

      vm.$options.render = function () {
        var slot = this.$slots.default;
        var vnode = getFirstComponentChild(slot); // vnode is a keep-alive-component-vnode

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
    }
    /** ********  callback functions ************/
    ;

    _proto.onInitial = function onInitial(vm) {
      var currentStateId = getStateId();

      if (isDef(currentStateId)) {
        this.setStackPointer(currentStateId);
      } else {
        this.setState(0);
      }

      this.historyStack.push(vm, this.stackPointer);
    };

    _proto.onPush = function onPush(vm) {
      var _this$pre;

      this.setState(this.increaseStackPointer());
      this.historyStack.push(vm, this.stackPointer);
      (_this$pre = this.pre) == null ? void 0 : _this$pre.$clearParent == null ? void 0 : _this$pre.$clearParent(vm);
      this.pre = null;
    };

    _proto.onBack = function onBack(vm) {
      this.historyStack.pop(vm);
      this.decreaseStackPointer();
      this.historyStack.push(vm, this.stackPointer);
    };

    _proto.onReplace = function onReplace(vm) {
      // avoidReplaceQuery is fix the issue : router.replace only a query by same path, may cause error
      var avoidReplaceQuery = this.replacePrePath === this.router.history.current.path;
      var shouldDestroy = !(isDef(this.replacePrePath) && this.replaceStay.includes(this.replacePrePath)) && !avoidReplaceQuery;

      if (shouldDestroy) {
        var _this$pre2;

        (_this$pre2 = this.pre) == null ? void 0 : _this$pre2.$keepAliveDestroy == null ? void 0 : _this$pre2.$keepAliveDestroy(vm);
      } else if (!avoidReplaceQuery) {
        var _this$pre3;

        (_this$pre3 = this.pre) == null ? void 0 : _this$pre3.$clearParent == null ? void 0 : _this$pre3.$clearParent(vm);
      }

      this.pre = null;
      this.setState(this.stackPointer);
      this.historyStack.push(vm, this.stackPointer);
      this.isReplace = false;
      this.replacePrePath = undefined;
    };

    _proto.setState = function setState(id) {
      this.setStackPointer(id);
      replaceState(this.mode, this.router, id);
    };

    _proto.setStackPointer = function setStackPointer(val) {
      this.router._stack = val;
    };

    _proto.increaseStackPointer = function increaseStackPointer() {
      return this.router._stack += 1;
    };

    _proto.decreaseStackPointer = function decreaseStackPointer() {
      return this.router._stack -= 1;
    };

    _createClass(VueRouterKeepAliveHelper, [{
      key: "currentVm",
      get: function get() {
        return getCurrentVM(this.router);
      }
    }, {
      key: "isPush",
      get: function get() {
        if (!this.isReplace) {
          var stateId = getStateId();
          return !isDef(stateId) || this.preStateId <= stateId;
        }

        return false;
      }
    }, {
      key: "stackPointer",
      get: function get() {
        return this.router._stack;
      }
    }]);

    return VueRouterKeepAliveHelper;
  }();

  function extendHistory(history) {
    var rstmp = history.replaceState;

    history.replaceState = function (state, op, path) {
      var old = Object.assign({}, history.state);
      var s = Object.assign(old, state);
      rstmp.call(history, s, op, path);
    };

    var historyPushState = history.pushState;

    history.pushState = function (state, op, path) {
      var old = Object.assign({}, history.state);
      var s = Object.assign(old, state);
      historyPushState.call(history, s, op, path);
    };
  }
  function extendVue(Vue) {
    var dtmp = Vue.prototype.$destroy;
    /**
     * @description remove the cache in <keep-alive> component before invoke $destroy
     */

    Vue.prototype.$keepAliveDestroy = function (vmCurrent) {
      if (this.$vnode && this.$vnode.data.keepAlive) {
        if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
          if (this.$vnode.componentOptions) {
            var key = !isDef(this.$vnode.key) ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? "::" + this.$vnode.componentOptions.tag : '') : this.$vnode.key;
            var cache = this.$vnode.parent.componentInstance.cache;
            var keys = this.$vnode.parent.componentInstance.keys;

            if (cache[key]) {
              if (keys.length) {
                var index = keys.indexOf(key);

                if (index > -1) {
                  keys.splice(index, 1);
                }
              }

              cache[key] = null; // fix memory leaks

              if (this.$vnode.parent && this.$vnode.parent.componentOptions && this.$vnode.parent.componentOptions.children && Array.isArray(this.$vnode.parent.componentOptions.children)) {
                this.$vnode.parent.componentOptions.children.length = 0;
              }

              if (cache[vmCurrent.$vnode.key] && cache[vmCurrent.$vnode.key].parent && cache[vmCurrent.$vnode.key].parent.componentOptions) {
                cache[vmCurrent.$vnode.key].parent.componentOptions.children = [cache[vmCurrent.$vnode.key]];
                cache[vmCurrent.$vnode.key].parent.elm = cache[vmCurrent.$vnode.key].parent.componentInstance.$el;
              }

              if (this.$parent.$children && Array.isArray(this.$parent.$children)) {
                var _index = this.$parent.$children.indexOf(this);

                if (_index >= 0) {
                  this.$parent.$children.splice(_index, 1);
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
        if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
          if (this.$vnode.componentOptions) {
            var key = !isDef(this.$vnode.key) ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? "::" + this.$vnode.componentOptions.tag : '') : this.$vnode.key;
            var cache = this.$vnode.parent.componentInstance.cache;

            if (cache[key]) {
              // fix memory leaks
              if (this.$vnode.parent && this.$vnode.parent.componentOptions && this.$vnode.parent.componentOptions.children && Array.isArray(this.$vnode.parent.componentOptions.children)) {
                this.$vnode.parent.componentOptions.children.length = 0;
              }

              if (cache[vmCurrent.$vnode.key] && cache[vmCurrent.$vnode.key].parent && cache[vmCurrent.$vnode.key].parent.componentOptions) {
                cache[vmCurrent.$vnode.key].parent.componentOptions.children = [cache[vmCurrent.$vnode.key]];
                cache[vmCurrent.$vnode.key].parent.elm = cache[vmCurrent.$vnode.key].parent.componentInstance.$el;
              } // if (
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

  var singleton; // TODO: 1. abstract mode support

  function createHelper(config) {
    if (config.Vue === undefined || config.router === undefined) {
      console.warn('warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper');
      return;
    }

    if (singleton) {
      return singleton;
    }

    if (inBrowser) {
      extendHistory(window.history);
    }

    extendVue(config.Vue);
    return singleton = new VueRouterKeepAliveHelper(config);
  }

  return createHelper;

})));
//# sourceMappingURL=index.js.map
