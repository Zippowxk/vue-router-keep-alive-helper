function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var e=function(t){return null!=t},n={__placeholder:!0},r=function(){var t=i();return e(t)?t.id:void 0},i=function(){return history.state},o=function(t,e){return"keep-alive-vnode-key"+Number(t)+e.history.current.path},a=function(t){return t.history.current.matched.length>0?t.history.current.matched[0].instances.default:void 0},s=function(t){if(Array.isArray(t))for(var n=0;n<t.length;n++){var r=t[n];if(e(r)&&(e(r.componentOptions)||c(r)))return r}},c=function(t){return t.isComment&&t.asyncFactory},h="undefined"!=typeof window,u=function(){function t(){this.historyStackMap=[]}var e=t.prototype;return e.push=function(t,e){var n=this.historyStackMap[e];if(Array.isArray(n))!n.includes(t)&&n.push(t),this.historyStackMap[e]=n.filter((function(t){return!t._isDestroyed}));else{var r=[];r.push(t),this.historyStackMap[e]=r}},e.pop=function(){var t=this.historyStackMap.pop();Array.isArray(t)&&t.forEach((function(t){return t&&t.$keepAliveDestroy&&t.$keepAliveDestroy()}))},e.removeGreater=function(t){for(;this.historyStackMap.length>=t;)this.pop()},e.clear=function(){this.historyStackMap=[]},t}(),p=function(){function i(t){var e=t.Vue,n=t.router,r=t.replaceStay;this.Vue=e,this.router=n,this.router._stack=0,this.mode=n.mode,this.historyShouldChange=!1,this.isReplace=!1,this.replacePrePath=void 0,this.preStateId=0,this.pre=null,this.replaceStay=r||[],this.hacked=!1,this.historyStack=new u,this.init()}var c,h,p,l=i.prototype;return l.init=function(){this.routerHooks(),this.hackRouter()},l.routerHooks=function(){var t=this,r=this.router;r.afterEach((function(i,s){t.historyShouldChange=!0,t.Vue.nextTick((function(){var i,s,c=t.currentVm,h=e(i=c)&&i.$vnode.data.keepAlive?i:n;null===t.pre?t.onInitial(h):t.isReplace?t.onReplace(h):t.isPush?t.onPush(h):t.onBack(h),t.pre=c,t.preStateId=t.stackPointer,(s=h)&&s.__placeholder||(!function(t,e){var n=a(t);n&&n._vnode&&(n._vnode.parent.key=e)}(r,o(t.stackPointer,r)),!t.hacked&&c&&t.hackKeepAliveRender(c.$vnode.parent.componentInstance),t.historyShouldChange=!1)}))}))},l.hackRouter=function(){var t=this,n=this.router,r=n.replace;n.replace=function(i,o,a){!function(i,o,a){t.isReplace=!0,t.replacePrePath=n.history.current.path,r.call(n,i,o,(function(n){t.isReplace=!1,t.replacePrePath=void 0,e(a)&&a(n)}))}(i,o,a)};var i=n.go;n.go=function(e){return r=e,t.isReplace=!1,i.call(n,r);var r};var o=n.push;n.push=function(e,r,i){return function(e,r,i){if(t.isReplace=!1,!r&&!i&&"undefined"!=typeof Promise)return o.call(n,e,r,i);o.call(n,e,r,i)}(e,r,i)}},l.hackKeepAliveRender=function(t){!function(t,n){if(e(t)&&e(t.cache)&&e(t.keys)){var r=t.keys,i=t.cache;if(1===r.length){var o=i[r[0]];delete i[r[0]],r.splice(0,1),r.push(n),i[n]=o}}}(t,o(this.stackPointer,this.router));var n=t.$options.render,r=this,i=this.router;t.$options.render=function(){var t=this.$slots.default,a=s(t);return r.historyShouldChange?a&&!e(a.key)&&(r.isReplace?a.key=o(r.stackPointer,i):r.isPush?a.key=o(r.stackPointer+1,i):a.key=o(r.stackPointer-1,i)):a.key=o(r.stackPointer,i),n.apply(this,arguments)},this.hacked=!0},l.onInitial=function(t){var n=r();e(n)?this.setStackPointer(n):this.setState(0),this.historyStack.push(t,this.stackPointer)},l.onPush=function(t){this.setState(this.increaseStackPointer()),this.historyStack.push(t,this.stackPointer)},l.onBack=function(t){this.historyStack.pop(),this.decreaseStackPointer(),this.historyStack.push(t,this.stackPointer)},l.onReplace=function(t){var n;e(this.replacePrePath)&&this.replaceStay.includes(this.replacePrePath)||(null==(n=this.pre)||null==n.$keepAliveDestroy||n.$keepAliveDestroy());this.setState(this.stackPointer),this.historyStack.push(t,this.stackPointer),this.isReplace=!1,this.replacePrePath=void 0},l.setState=function(t){this.setStackPointer(t),function(t,n,r){var i=window.location,o=""+i.pathname+i.search+i.hash,a=e(history.state)?history.state:{};a.id=r;var s=window.location.href.startsWith("file://");history.replaceState(a,"",s?null:o)}(this.mode,this.router,t)},l.setStackPointer=function(t){this.router._stack=t},l.increaseStackPointer=function(){return this.router._stack+=1},l.decreaseStackPointer=function(){return this.router._stack-=1},c=i,(h=[{key:"currentVm",get:function(){return a(this.router)}},{key:"isPush",get:function(){if(!this.isReplace){var t=r();return!e(t)||this.preStateId<=t}return!1}},{key:"stackPointer",get:function(){return this.router._stack}}])&&t(c.prototype,h),p&&t(c,p),i}();var l=void 0;function f(t){var n,r;if(void 0!==t.Vue&&void 0!==t.router)return l||(h&&function(t){var e=t.replaceState;t.replaceState=function(n,r,i){var o=Object.assign({},t.state),a=Object.assign(o,n);e.call(t,a,r,i)};var n=t.pushState;t.pushState=function(e,r,i){var o=Object.assign({},t.state),a=Object.assign(o,e);n.call(t,a,r,i)}}(window.history),n=t.Vue,r=n.prototype.$destroy,n.prototype.$keepAliveDestroy=function(){if(this.$vnode&&this.$vnode.data.keepAlive&&this.$vnode.parent&&this.$vnode.parent.componentInstance&&this.$vnode.parent.componentInstance.cache&&this.$vnode.componentOptions){var t=e(this.$vnode.key)?this.$vnode.key:this.$vnode.componentOptions.Ctor.cid+(this.$vnode.componentOptions.tag?"::"+this.$vnode.componentOptions.tag:""),n=this.$vnode.parent.componentInstance.cache,i=this.$vnode.parent.componentInstance.keys;if(n[t]){if(i.length){var o=i.indexOf(t);o>-1&&i.splice(o,1)}delete n[t]}}r.apply(this,arguments)},l=new p(t));console.warn("warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper")}export default f;
//# sourceMappingURL=helper.esm.js.map
