<template>
  <div class="users">

    <ul>
      <li v-for="user in users" >
        <h2>{{user.name}}</h2>
        <h3>{{user.email}}</h3>
      </li>
    </ul>

    <button v-on:click="deleteUser">删除</button>
  </div>
</template>
<!--
  传值 : string boolean number
  引用 : array object

-->
<script>
    export default {
        name: "users",
        // props:["users"],
        props:{
          users : {
            type: Array,
            require : true
          }
        },
        data(){
          return {

          }

        },
        methods: {
          deleteUser:function () {
            this.users.pop();
          }
        },
      created:function () {

      }
    }
</script>

<style scoped>
.users {
  width:100%;
  max-width: 1200px;
  margin:40px auto;
  padding:0 20px;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
}
  ul {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding:0;
  }
  li {
    flex-grow: 1;
    flex-basis: 200px;
    text-align: center;
    padding:20px;
    border:1px solid #333;
    margin:10px;
  }
</style>
