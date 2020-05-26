<template>
  <div class="banner">
    <el-row type="flex" justify="center" :gutter="1">
      <!--<el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1"></el-col>-->
      <el-col
          :xs="rowSetting.side.xs"
          :sm="rowSetting.side.sm"
          :md="rowSetting.side.md"
          :lg="rowSetting.side.lg"
          :xl="rowSetting.side.sl"
      >
        <table class="title-table head-sj">
          <td class="head-sj-left">
            <div class="sj-title">数据总量</div>
            <br/>
            <div class="sj-sl">22亿896万条</div>
          </td>
          <td class="head-sj-middle">
            &nbsp;
          </td>
          <td class="head-sj-right">
            <div class="sj-title">资源存储</div>
            <br/>
            <div class="sj-sl">1.3T</div>
          </td>
        </table>
      </el-col>
      <el-col
          :xs="rowSetting.center.xs"
          :sm="rowSetting.center.sm"
          :md="rowSetting.center.md"
          :lg="rowSetting.center.lg"
          :xl="rowSetting.center.sl"
      >
        <table class="title-table">
          <td class="head-title-left"></td>
          <td class="head-title-middle">
            <div class="head-title">{{ title }}</div>
          </td>
          <td class="head-title-right"></td>
        </table>
      </el-col>
      <el-col
          :xs="rowSetting.side.xs"
          :sm="rowSetting.side.sm"
          :md="rowSetting.side.md"
          :lg="rowSetting.side.lg"
          :xl="rowSetting.side.sl"
      >
        <table class="title-table head-sj">
          <td class="head-sj-left">
            <div class="sj-title">数据种类</div>
            <br/>
            <div class="sj-sl">148类</div>
          </td>
          <td class="head-sj-middle">
            &nbsp;
          </td>
          <td class="head-sj-right">
            <div class="sj-title">今日增量</div>
            <br/>
            <div class="sj-sl">2532万条</div>
          </td>
        </table>
      </el-col>
    </el-row>
  </div>
</template>


<script>
  import {APP_NAME} from '@/setting'
  import RC from '@/utils/rowComputer.js'

  export default {
    name: 'layout-banner',
    data() {
      return {
        /**
         * hidden-xs-only - 当视口在 xs 尺寸时隐藏
         * hidden-sm-only - 当视口在 sm 尺寸时隐藏
         * hidden-sm-and-down - 当视口在 sm 及以下尺寸时隐藏
         * hidden-sm-and-up - 当视口在 sm 及以上尺寸时隐藏
         * hidden-md-only - 当视口在 md 尺寸时隐藏
         * hidden-md-and-down - 当视口在 md 及以下尺寸时隐藏
         * hidden-md-and-up - 当视口在 md 及以上尺寸时隐藏
         * hidden-lg-only - 当视口在 lg 尺寸时隐藏
         * hidden-lg-and-down - 当视口在 lg 及以下尺寸时隐藏
         * hidden-lg-and-up - 当视口在 lg 及以上尺寸时隐藏
         * hidden-xl-only - 当视口在 xl 尺寸时隐藏
         */
        rowSetting: {
          center: {
            xs: 14, sm: 14, md: 14, lg: 12, xl: 10
          },
          side: {
            xs: 5, sm: 5, md: 5, lg: 6, xl: 7
          }
        }
      }
    },
    props: {
      title: {
        type: String,
        default: APP_NAME
      }
    },
    created() {
      let rs = RC.computer(60 + 60 + 320);
      this.rowSetting.center = rs.center;
      this.rowSetting.side = rs.side;

    },
    computed: {
    },
    methods: {}
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

  @import "src/styles/variables.scss";


  $imgPath: "../../../assets";



  $titleHeight: 65px;

  .banner {
    height: $titleHeight;
    text-align: center;
    background-image: url($imgPath + "/px/bg.jpg");
    /*background-color: white;*/
  }

  .head-title {
    font-family: $fontFamily;
    font-size: 24px;
    text-align: center;
    display: inline-block;
    margin-top: 10px;
  }

  .title-table{
    margin:auto;
    height: $titleHeight;
    border: 0px;
  }

  .head-title-left {
    background-image: url($imgPath + "/px/head-title-left.png");
    text-align: center;
    height: $titleHeight;
    width: 60px;
    background-repeat: no-repeat;
    float: left;
  }

  .head-title-middle {
    background-image: url($imgPath + "/px/head-title-middle.png");
    text-align: center;
    height: $titleHeight;
    width: 320px;
    text-align: center;
    color: #E7B76C;
    float: left;
  }

  .head-title-right {
    background-image: url($imgPath + "/px/head-title-right.png");
    text-align: center;
    height: $titleHeight;
    width: 60px;
    background-repeat: no-repeat;
    float: left;
  }


  .head-sj {
    background-image: url($imgPath + "/px/head-sj.png");
  }

  .head-sj-left {
    //border:1px solid red;
    min-width: 120px;
    height: 100%;
    float: left;
  }

  .head-sj-middle {
    //border:1px solid red;
    height: 100%;
    width: 6px;
    float: left;
  }

  .head-sj-right {
    //border:1px solid red;
    height: 100%;
    min-width: 120px;
    float: left;
  }

  .head-blank {
    height: $titleHeight;
    float: left;
    min-width: 2px;

  }

  .sj-title {
    font-family: $fontFamily;
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    display: inline-block;
    color: #E7B76C;
    margin-top: 15px;
  }

  .sj-sl {
    font-family: $fontFamily;
    font-size: 10px;
    text-align: center;
    display: inline-block;
    color: white;
  }


</style>

