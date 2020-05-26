<template>
  <div id="home">
    <app-header v-on:titleChanged="updateTitle($event)" v-bind:title="title" ></app-header>
    <users v-bind:users="users"></users>
    <app-footer v-bind:title="title"></app-footer>
  </div>
</template>

<script>
  //局部注册组件
  import Users from "./Users";
  import Header from "./Header";
  import Footer from "./Footer";
  export default {
    name: 'home',
    data:function(){
      return {
        users:[
          /*{name: "Henry" , position : "web 开发" ,show : false },
          {name: "Bucky" , position : "web 开发" ,show : false },
          {name: "Emily" , position : "web 开发" ,show : false },
          {name: "John" , position : "web 开发" ,show : false },
          {name: "Hemiah" , position : "web 开发" ,show : false },*/
        ],
        title : "传递的是一个值 ,(number , string , boolean)"
      }
    },
    components: {
      "users" : Users,
      "app-header": Header,
      "app-footer" : Footer
    },
    methods : {
      updateTitle : function (title) {
        this.title = title;
      }
    },
    created() {
      this.$http.get("http://localhost:3000/users")
        .then((data) => {
          this.users = data.body;
        })
    }
  }
</script>

<style>
  body {
    margin:0;
    padding:0;
  }
  #home {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
