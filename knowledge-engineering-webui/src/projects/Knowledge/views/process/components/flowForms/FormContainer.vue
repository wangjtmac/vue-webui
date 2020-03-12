<!--
 此处填写文件描述
 @Author: zhanbh
 @Date: 2019-12-31
-->
<template>
    <el-card class="form-container" shadow="never">
        <slot name="header" slot="header" >
            <span>{{title}}</span>
            <i class="icon-close-btn el-icon-close fr" @click="handleClickCancel"></i>
        </slot>
        <slot></slot>
        <slot name="footer" v-if="showFooter">
            <div class="tr">
                <el-button size="small" @click="handleClickCancel">取消</el-button>
                <el-button size="small" type="primary" @click="handleClickSave">保存</el-button>
            </div>
        </slot>
    </el-card>
</template>
<script>
    export default {
        name: "FormContainer",
        props: {
            title: String,
            showFooter: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {};
        },
        computed: {},
        methods: {
            handleClickCancel() {
                this.$emit('close');
            },
            handleClickSave() {
                this.$emit('save');
            }
        },
        created() {
        }
    };
</script>
<style scoped lang="less">
    .form-container {
        height: 100%;
        box-sizing: border-box;
        overflow: auto;
        .icon-close-btn{
            line-height: inherit;
            cursor: pointer;
        }
    }
</style>