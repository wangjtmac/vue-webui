<template>
    <div class="breadcrumb">
        <i class="icon ce-crumb__icon">&#xe60e;</i>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="(item , i) in crumb" :key="i" >{{item}}</el-breadcrumb-item>
        </el-breadcrumb>
    </div>
</template>

<script>
    export default {
        name: "Breadcrumb",
        data(){
            return {

            }
        },
        props : {
            crumb : Array
        }
    }
</script>

<style scoped lang="less">
    @import "../../../public/css/global";
    .breadcrumb {
        padding: 13px 10px;
        border: 1px solid #e7ecf1;
        border-top: none;
        background: #fff;
    }
    .ce-crumb__icon {
        float: left;
        line-height:1;
        padding-right: 5px;
        color: @minor-font;
    }
</style>