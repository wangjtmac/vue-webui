<template>
  <footer>
    <p>{{copyright}} {{title}}</p>

  </footer>
</template>

<script>
  export default {
    name: "app-footer",
    props:{
      title : {
        type: String
      }
    },
    data:function () {
      return {
        copyright : "copyright 2019 vue.js demo"
      }
    }
  }
</script>

<style scoped>
  footer {
    background:#888;
    padding:6px;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }
  p  {
    color:lightgreen;
    text-align: center;
    margin:0;
  }
</style>
