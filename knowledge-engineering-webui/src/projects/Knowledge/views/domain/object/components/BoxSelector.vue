<!--
 框形式选择器，
 还是雏形 根据需求后期改造
 @Author: zhanbh
 @Date: 2019-11-07
-->
<template>
    <div class="box-selector">
        <div v-if="title" class="box__title">{{title}}</div>
        <ul>
            <li v-for="(item, index) in data" :key="index">{{item.featuresName}}</li>
        </ul>
    </div>
</template>
<script>
    export default {
        name: "BoxSelector",
        props: {
            data: {
                type: Array,
                default() {
                    return []
                }
            },
            title: String
        },
        data() {
            return {};
        },
        computed: {},
        methods: {},
        created() {
        }
    };
</script>
<style scoped lang="less">
    .box-selector{
        border: 1px solid #EBEEF5;
        box-sizing: border-box;
        .box__title{
            line-height: 40px;
            box-sizing: border-box;
            height: 40px;
            background: #F5F7FA;
            margin: 0;
            padding-left: 15px;
            border-bottom: 1px solid #EBEEF5;
        }
        ul {
            max-height: 246px;
            overflow: auto;
            box-sizing: border-box;
            li{
                height: 26px;
                line-height: 26px;
                box-sizing: border-box;
                padding-left: 15px;
            }
        }
    }
</style>