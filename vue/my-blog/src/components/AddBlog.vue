<template>
  <div class="add-blog container mb-5">
    <div class="card bg-secondary text-white" v-if="!submited">
      <div class="card-header">
        <h1 class="card-title">添加博客</h1>
      </div>
      <div class="card-body">
        <form class="">
          <div class="form-group">
            <label for="blogTitle">博客标题</label>
            <input type="text" id="blogTitle" name="blogTitle" class="form-control" v-model="blog.title" required>
          </div>
          <div class="form-group">
            <label for="blogCont">博客内容</label>
            <textarea name="blogCont" id="blogCont" cols="30" rows="5" class="form-control resizen"
                      v-model="blog.content"></textarea>
          </div>
          <div class="form-group" id="checkboxs">
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="blogClass1" value="Vue.js" v-model="blog.categories">
              <label class="form-check-label" for="blogClass1">Vue.js</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="blogClass2" value="Node.js" v-model="blog.categories">
              <label class="form-check-label" for="blogClass2">Node.js</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="blogClass3" value="React.js"
                     v-model="blog.categories">
              <label class="form-check-label" for="blogClass3">React.js</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="checkbox" id="blogClass4" value="Angular4"
                     v-model="blog.categories">
              <label class="form-check-label" for="blogClass4">Angular4</label>
            </div>

          </div>
          <div class="form-group">
            <label>作者</label>
            <select name="" class="form-control" v-model="blog.author">
              <option value="" disabled>请选择作者</option>
              <option v-for="author in authors" :key="author">{{author}}</option>
            </select>
          </div>
          <button class="btn btn-block btn-primary" v-on:click.prevent="post">添加博客</button>
        </form>
      </div>
    </div>

    <div v-if="submited" class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>博客发布成功!</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="card mt-3">
      <div class="card-header">
        <h1 class="card-title">博客总览</h1>
      </div>
      <div class="card-body">
        <h4>博客标题</h4>
        <p class="card-text">{{blog.title}}</p>
        <h4>博客内容</h4>
        <p class="card-text">{{blog.content}}</p>
        <ul class="list-group mb-3">
          <li v-for="category in blog.categories" :key="category" class="list-group-item">{{category}}</li>
        </ul>
        <h4>作者</h4>
        <p class="form-text">{{blog.author}}</p>
      </div>
    </div>


  </div>
</template>

<script>
  export default {
    name: "AddBlog",
    data() {
      return {
        blog: {
          title: "",
          content: "",
          categories: [],
          author: ""
        },
        authors: ["Henry", "Bucky", "Emily"],
        submited: false

      };
    },
    methods: {
      post() {
        this.$http.post("http://localhost:3000/posts", {
          title: this.blog.title,
          body: this.blog.content,
          userId: 10
        })
          .then(function (data) {
            // console.log(data);
            this.submited = true;
            setTimeout(()=>{
              $('.alert').alert('close');
            },3000)
          })
      },
      onclick(){

      }
    }
  }
</script>

<style scoped>

</style>
