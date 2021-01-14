# vue-router-keep-alive-helper
Vue Router Keep-alive Helper 是一款SPA应用keep-alive页面自动管理工具，仅需一行配置代码即可使用。

### 诞生背景：
在使用```Vuejs```搭配```VueRouter```开发单页面应用时，经常使用keep-alive缓存浏览过的页面来提升用户体验，在原生App中，应用程序会维护一个页面栈， 页面从A=>B=>C时，保留A B C三个页面，在返回页面B时，销毁页面C是一个常规操作，但是在前端Web开发时，keep-alive的页面管理变得不那么容易，我们需要在返回时手动销毁页面。

### 可解决的问题：
支持把所有页面设置为keep-alive,并且在浏览器返回或者触发```router.back```方法时自动销毁栈顶keep-alive页面，完全模拟原生App的页面管理方案

### 使用方式

1. ```npm i -s vue-router-keep-alive-helper```
2. 将所有页面设置为keep-alive
```html
...
<keep-alive>
  <router-view/>
</keep-alive>
...
```
3. 在vue-router初始化时 添加helper
```javascript
import createHelper from 'vue-router-keep-alive-helper'
import Vue from 'vue'
const router = new VueRouter({routes})
createHelper({Vue, router});
...
```

### 配置

1. replace白名单
  
  在tab栏切换时，需要留存某些tab页面，可以在replaceStay中配置这些路径
```javascript
  createHelper({Vue, router, replaceStay:["/home","/cart","/mine"]});
```

欢迎添加微信 **OmniBug **探讨交流，Email: zippowangxinkai@gmail.com

