<template>
  <div class="home">
    <h1>Home page</h1>
    <div @click='goAbout'>Go About</div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  beforeCreate() {
    debugger
    console.log('home before create');
  },
  methods: {
    goAbout() {
      this.$router.push('/about')
    }
  },
}
</script>
