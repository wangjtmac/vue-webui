<template>
    <header>
      <h1 v-on:click="changeTitle">{{title}}</h1>

    </header>
</template>

<script>
    export default {
      name: "app-header",
      props:{
          title : {
            type: String
          }
      },
      data:function () {
        return {
          // title : "Vue.js Demo"
        }
      },
      methods : {
        changeTitle:function () {
          this.$emit("titleChanged","子向父组件传值!")
        }
      },
      //生命周期
     /* beforeCreate : function () {
        alert("组件实例化前执行的函数")
      },
      created : function () {
        alert("组件实例化完毕,但页面未显示")
      },
      beforeMount : function () {
        alert("组件挂载前,页面仍未显示,虚拟Dom 已经配置")
      },
      mounted : function () {
        alert("组件挂载后，页面显示")
      },
      beforeUpdate : function () {
        alert("组件更新前，页面未更新,虚拟Dom 已经配置")
      },
      updated : function () {
        alert("组件更新后，页面更新")
      },
      beforeDestroy : function () {
        alert("组件销毁前")
      },
      destroyed : function () {
        alert("组件销毁")
      }*/

    }
</script>

<style scoped>
  header {
    background:lightgreen;
    padding:10px;
  }
  h1  {
    color: #333;
    text-align: center;
  }
</style>
