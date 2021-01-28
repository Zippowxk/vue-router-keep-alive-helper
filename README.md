# vue-router-keep-alive-helper
`Vue Router Keep-alive Helper` is an automatic tool for managing cache pages in the `Vue.js` project, only one line of configuration code can be used.

English | [简体中文](./README_CN.md)

### Why you need this helper：

When developing a SPA project of `Vue.js` with `vue-router`, `<keep-alive>` is always used to cach pages which are already routed,there are three options to manage the cache tree inside it,
```
include - Only components with matching names will be cached.
exclude - Any component with a matching name will not be cached.
max - The maximum number of component instances to cache.
```
But these options are only useful in simple situations, otherwise they're useless,such as:

1. destroy current page cache when routing back.
2. cache more than one instances which using same component,and destroy one of them specifically.

### Features

1. Recognize `pushing` `going back` or `replacing` automatically
2. Destroy current page cache when routing back
3. Always create and cache a new instance,even if this component is already cached
4. Keep the same status after browser refreshing
5. `replaceStay` white list allows cache pages when replacing

### Usage

1. ```npm i -s vue-router-keep-alive-helper```
2. keep alive the `router-view`
```html
...
<keep-alive>
  <router-view/>
</keep-alive>
...
```
3. create helper after router is created
```javascript
import createHelper from 'vue-router-keep-alive-helper'
import Vue from 'vue'
const router = new VueRouter({routes})
createHelper({Vue, router});
...
```

### Config

1. replace white list
  
  
  When switching the tab bar, some tab pages need to be cached，you can set the paths in replaceStay option
```javascript
  createHelper({Vue, router, replaceStay:["/home","/cart","/mine"]});
```


### Sample code

1. [static file](./examples/)
2. [webpack](https://github.com/Zippowxk/vue-router-helper-demo)

Twitter **zippowxk**，Email: zippowangxinkai@gmail.com

