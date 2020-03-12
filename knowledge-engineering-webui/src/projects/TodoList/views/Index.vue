<template>
  <div class="index">
    <div id="nav">
      <h1>This is an Index page</h1>
      <router-link to="/todolist/home">Home</router-link> |
      <router-link to="/datacenter">datacenter</router-link>
    </div>
    <router-view/>
  </div>
</template>
<script>
    // @ is an alias to /src
    export default {
        name: 'Index',
    }
</script>
<style lang="less">
  #nav {
    padding: 30px;
    a {
      font-weight: bold;
      color: #2c3e50;
      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>