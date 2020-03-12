<template>
    <div class="header">
        <router-link to="/todolist">
        <div class="logo">{{sysName}}</div></router-link>
        <ul class="ce-user__list">
            <li>
                <div class="ce-user__img">
                    <el-avatar @error="errorHandler" :size="28" fit="cover" :src="user.img_url" alt="用户头像">
                        <i class="icon f18">&#xe690;</i>
                    </el-avatar>
                </div>
                <div class="ce-user__name">{{user.name}}</div>
            </li>
            <li>
                <a class="ce-logout" href="javascript:void(0);">
                    <i class="icon">&#xe6f7;</i>
                    退出
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "Header",
        props : {
            user : Object,
            sysName : String
        },
        data(){
            return {
            }
        },
        methods : {
            errorHandler() {
                return true
            }
        }
    }
</script>

<style scoped>
    .header {
        background: #2991d9 url(../../assets/images/header/header_bg.jpg) no-repeat;
        background-size: cover;
        height: 50px;
        overflow: hidden;
    }
    .logo {
        font-size: 24px;
        color: #fff;
        font-weight: bold;
        line-height: 50px;
        width: 160px;
        height: 50px;
        padding-left: 40px;
        background: url(../../assets/images/header/logo.png) no-repeat left center;
        margin-left: 10px;
        float: left;
    }

    .ce-user__list {
        float: right;
        font-size: 14px;
        margin-right: 26px;
    }
    .ce-user__name {
        color: #fff;
        float: left;

    }
    .ce-user__img {
        width: 28px;
        height: 28px;
        margin:10px 10px 0 0;
        /*border-radius: 50%;*/
        /*overflow: hidden;*/
        float: left;
    }
    .ce-logout {
        color: #fff;
        font-size: 14px;
    }
    .ce-user__img > img {
        width: 28px;
        vertical-align: top;
    }
    .ce-user__list > li {
        float: left;
        height: 50px;
        line-height: 50px;
        margin-left: 20px;
    }
</style>