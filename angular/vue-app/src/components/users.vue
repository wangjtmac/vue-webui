<template>
  <div class="users">
    <h1>users</h1>
    <form v-on:submit="addUser">
      <input type="text" v-model="newUser.name" placeholder="Enter name">
      <input type="text" v-model="newUser.email" placeholder="Enter email">
      <input type="submit" value="Submit">
    </form>
    <ul>
      <li v-for="user in users">
        <input type="checkbox" class="toggle" v-model="user.contacted">
        <span :class="{contacted:user.contacted}">
          {{user.name}} : {{user.email}}
          <button v-on:click="deleteUser(user)">x</button>
        </span>

      </li>
    </ul>
  </div>
</template>

<script>
    export default {
        name: "users",
        data(){
          return {
            newUser:{},
            users:[
              {
                name:"Hemiah Wu",
                email:"hemiah@gmail.com",
                contacted:false
              },
              {
                name:"Henry",
                email:"henry@gmail.com",
                contacted:false
              },
              {
                name:"Emily",
                email:"emily@gmail.com",
                contacted:false
              }

            ]
          }

        },
        methods: {
          addUser:function (e) {
            this.users.push({
              name:this.newUser.name,
              email:this.newUser.email,
              contacted:false
            });
            e.preventDefault();
          },
          deleteUser:function (user) {
            this.users.splice(this.users.indexOf(user),1);
          }
        },
      created:function () {
        this.$http.get("http://localhost:3000/users")
          .then(function (response) {
              this.users = response.data;
        })
      }
    }
</script>

<style scoped>
  .contacted {
    text-decoration: line-through;
  }
</style>
