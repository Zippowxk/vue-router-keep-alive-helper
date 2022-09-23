<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div @click='goInfo'>Go Info</div>
  </div>
</template>

<script>

export default {
  name: 'About',
  beforeCreate() {
    console.log('about before create');
  },
  methods: {
    goInfo() {
      this.$router.push('/info')
    }
  },
}
</script>
