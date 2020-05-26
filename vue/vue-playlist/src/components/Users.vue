<template>
    <div class="users">
      <ul>
        <li v-for="(user , index) in users" :key="index">{{user}}</li>
      </ul>
    </div>
</template>

<script>
    export default {
        name: "Users",
      data (){
          return {
            users : ['Henry','Bucky' , 'John']
          }
      }
    }
</script>

<style scoped>

</style>
