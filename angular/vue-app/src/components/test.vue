<template>
    <div class="test">
      <!--获取数据-->
      <h1>{{title}}</h1>
      <p>{{user.firstName}}</p>
      <p v-text="user.lastName"></p>

      <!--v-if-->
      <p v-if="showName">{{user.lastName}}</p>
      <!--v-else-->
      <p v-else >Nobody</p>
      <!--v-for-->
      <ul>
        <li v-for="item in items">{{item.title}}</li>
      </ul>

      <!--v-on-->
      <button v-on:click="greet('Hello Everybody!')">say Greeting</button>
      <!--键盘事件-->
      <input type="text" v-on:keyup="pressKey" v-on:keyup.ctrl.alt.enter="enterHit">
      <!-- .ctrl.shift.enter-->
      <hr>
      <!-- computed 计算属性-->
      <label>firstName</label>
      <input type="text" v-model="user.firstName">
      <br>
      <label>lastName</label>
      <input type="text" v-model="user.lastName">
      <br>
      <h3>{{fullName}}</h3>

      <!-- props 属性-->
      <h2>{{msg}}</h2>
    </div>
</template>

<script>
    export default {
        name: "test",
      props:{
          msg:{
            type:String,
            default:"属性内容值"
          }
      },
        data(){
          return {
            title:"Hello Vue.js!",
            user : {
              firstName : "Hemiah",
              lastName : "Wu"
            },
            showName : false,
            items:[
              {title:"item1"},
              {title:"item2"},
              {title:"item3"}
            ]
          }
        },
      methods:{
          greet:function(str){
            console.log(str);
          },
          pressKey:function(){
            console.log("pressKey..");
          },
        enterHit:function () {
          console.log("you pressed enter key!")
        }
      },
      computed:{
          fullName : function () {
            return this.user.firstName + " " + this.user.lastName;
          }
      }
    }
</script>

<style scoped>

</style>
