<template>
  <div id="app">
    <ul>
      <li><router-link to="./">Home</router-link></li>
      <li><router-link to="./helloworld">Hello</router-link></li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  data:function(){
    return {

    }
  }
}
</script>

<style>
  body {
    margin:0;
    padding:0;
  }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
