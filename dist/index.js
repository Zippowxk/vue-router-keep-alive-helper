!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).routerHelper=t()}(this,(function(){"use strict";function e(e){var t=function(e){return null!=e};if(void 0!==e.Vue&&void 0!==e.router){var n,o=e.Vue,r=e.router,i=r.mode,c=e.replaceStay||[],a=!1;r._stack=0;var s,u=!1,p=0,f=!1,h={},d=t(e.publicPath)?e.publicPath:"";r.beforeEach((function(e,t,o){n=j(),o()})),r.afterEach((function(e,t){f=!0,o.nextTick((function(){void 0===n?v():u?m():x()?y():k(),p=Number(r._stack),N();var e=j();!a&&e&&$(e.$vnode.parent.componentInstance),f=!1}))}));var l=r.replace;r.replace=function(e,n,o){if(u=!0,s=r.history.current.path,!n&&!o&&"undefined"!=typeof Promise)return new Promise((function(t,n){l.call(r,e).then((function(){return t()})).catch((function(e){u=!1,s=void 0,n(e)}))}));l.call(r,e,n,(function(e){u=!1,s=void 0,t(o)&&o(e)}))};var v=function(e){t(g())?r._stack=g():w(0),_(j())},y=function(){r._stack++,w(r._stack),_(j())},k=function(){r._stack--,b(r._stack),_(j())},m=function(){t(s)&&-1!==c.indexOf(s)||n.$keepAliveDestroy(),w(r._stack),_(j()),u=!1,s=void 0},$=function(e){C(e,A(r._stack));var n=e.$options.render;e.$options.render=function(){var e=this.$slots.default,o=D(e);return f?t(o.key)||(u?o.key=A(r._stack):x()?o.key=A(Number(r._stack)+1):o.key=A(Number(r._stack)-1)):o.key=A(r._stack),n.apply(this,arguments)},a=!0},_=function(e){var t=r._stack;if(h.hasOwnProperty(t)&&h[t]){h[t].push(e)}else{var n=[];n.push(e),h[t]=n}},b=function(e){!t(h)||h.length<=0||Object.keys(h).forEach((function(n){if(!(n<=e)){var o=h[n];if(t(o)&&!(o.length<=0))for(var r=o.pop();t(r);)r.$keepAliveDestroy(),r=o.pop()}}))},g=function(){var e=I();return t(e)?e.id:void 0},w=function(e){var n=("hash"===i?"#":"")+d+r.history.current.path;window.location.href.startsWith("file://")&&(n=("hash"===i?window.location.href.split("#")[0]:window.location.href.splice(".html")[0]+".html")+n);n+=O(r.history.current.query);var o=t(history.state)?history.state:{};o.id=e,history.replaceState(o,"",n)},O=function(e){var t="";return(t=Object.keys(e).map((function(t){return encodeURIComponent(t)+"="+encodeURIComponent(e[t])})).join("&")).length>0&&(t="?"+t),t},I=function(){return history.state},x=function(){return!u&&(!t(g())||p<g())},A=function(e){return"keep-alive-vnode-key"+Number(e)+r.history.current.path},j=function(){return r.history.current.matched.length>0?r.history.current.matched[0].instances.default:void 0},N=function(){var e,t=j();t&&t._vnode&&(t._vnode.key=(e=r._stack,"vnode-key"+Number(e)+r.history.current.path),t._vnode.parent.key=A(r._stack))},P=history.replaceState;history.replaceState=function(e,t,n){var o=Object.assign(history.state|{},e);P.call(history,o,t,n)};var C=function(e,n){if(t(e)&&t(e.cache)&&t(e.keys)){var o=e.keys,r=e.cache;if(1===o.length){var i=r[o[0]];delete r[o[0]],o.splice(0,1),o.push(n),r[n]=i}}},S=o.prototype.$destroy;o.prototype.$keepAliveDestroy=function(){if(this.$vnode&&this.$vnode.data.keepAlive&&this.$vnode.parent&&this.$vnode.parent.componentInstance&&this.$vnode.parent.componentInstance.cache&&this.$vnode.componentOptions){var e=t(this.$vnode.key)?this.$vnode.key:this.$vnode.componentOptions.Ctor.cid+(this.$vnode.componentOptions.tag?"::"+this.$vnode.componentOptions.tag:""),n=this.$vnode.parent.componentInstance.cache,o=this.$vnode.parent.componentInstance.keys;if(n[e]){if(o.length){var r=o.indexOf(e);r>-1&&o.splice(r,1)}delete n[e]}}S.apply(this,arguments)};var D=function(e){if(Array.isArray(e))for(var n=0;n<e.length;n++){var o=e[n];if(t(o)&&(t(o.componentOptions)||E(o)))return o}},E=function(e){return e.isComment&&e.asyncFactory}}else console.warn("warning: router helper needs Vue and root router ,see more for guide : https://github.com/Zippowxk/vue-router-keep-alive-helper")}return"undefined"!=typeof window&&(window.createHelper=e),e}));
//# sourceMappingURL=index.js.map
