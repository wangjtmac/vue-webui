<template>
  <div id="app">
      <app-header></app-header>
    <div class="container mb-3">
      <router-view></router-view>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12 col-md-4">
          <router-view name="orderingGuide"></router-view>
        </div>
        <div class="col-sm-12 col-md-4">
          <router-view name="history"></router-view>
        </div>
        <div class="col-sm-12 col-md-4">
          <router-view name="delivery"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './components/Header'

export default {
  name: 'App',
  components: {
    "app-header" : Header
  }
}
</script>

<style>
  @import "css/style.css";

</style>
