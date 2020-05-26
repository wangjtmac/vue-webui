<template>
  <div id="app">
    <add-blog></add-blog>

  </div>
</template>

<script>


import AddBlog from './components/AddBlog'

export default {
  name: 'App',
  components: {
    "add-blog":AddBlog
  },
  methods:{

  }
}
</script>

<style>
@import "assets/bootstrap/dist/css/bootstrap.min.css";
@import "assets/css/bootstrap.min.css";
@import "assets/css/zxx.lib.css";

</style>
