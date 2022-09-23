<template>
  <div id="app">
    <!-- <transition name="slide-left" > -->
      <keep-alive>
        <router-view/>
      </keep-alive>
    <!-- </transition> -->
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}


.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  will-change: transform;
  transition: transform 350ms;
  position: fixed;
  pointer-events: none;
  width: 100%;
  height: 100%;
}

.slide-left-enter-active,
.slide-right-leave-active {
  z-index: 99;
}

.slide-right-enter-from {
  z-index: 1;
  transform: translate3d(-100%, 0, 0);
}

.slide-right-leave-active {
  transition-delay: 100ms;
  transform: translate3d(100%, 0, 0);
}

.slide-left-enter-from {
  transform: translate3d(100%, 0, 0);
}

.slide-left-leave-active {
  transform: translate3d(-50%, 0, 0);
  z-index: 0;
}
</style>
