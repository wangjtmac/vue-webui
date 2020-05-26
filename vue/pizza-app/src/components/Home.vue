<template>
  <div class="row">
    <div id="home" class="col-sm-12 text-center">
      <div class="background">
        <h1>欢迎大家品尝pizza!</h1>
        <h2>这里有你非常喜欢的pizza!</h2>
        <button @click="goToMenu" name="button" class="btn btn-success">Let's order!</button>

      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Home",
    methods: {
      goToMenu() {
        //跳转到上一次浏览的页面
        // this.$router.go(-1);

        //跳转到指定地址
        // this.$router.replace('/menu');

        //指定跳转到路由名字下
        // this.$router.replace({name:'menuLink'});

        //通过push 进行跳转
        // this.$router.push('/menu');
        // this.$router.push({name:'menuLink'});
      }

    }
  }
</script>

<style scoped>
  #home {
    background: url("../../src/assets/img.jpg");
    height: 78vh;
    padding: 10%;
  }

  h1, h2 {
    margin: 6%;
  }

  .background {
    background:#eee;
    max-width:70vw;
    opacity: 0.8;
    margin:auto;
    padding:20px 0;
  }
</style>
