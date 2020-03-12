<!--
 领域对象管理主页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <left-main-layout class="domain rel">
        <template slot="left">
            <relation-menu
                    @current-change="handleCurrentChange"
                    @domain-change="handleDomainChange"
                    ref="relationMenu"
            />
        </template>
        <template>
            <list-view :relation="relation"
                       @excel-input="excelInputSuccess"
                       @dbInput="dbInputSaveSuccess"
                       :domainId="domainId"></list-view>
        </template>
    </left-main-layout>
</template>

<script>
    import RelationMenu from './components/RelationMenu'
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import ListView from './ListView'

    export default {
        name: 'Relation',
        data() {
            return {
                relation: null,
                domainId: ''
            }
        },
        watch: {

        },
        methods: {
            handleCurrentChange(data, node) {
                this.relation = data;
            },
            handleDomainChange(domain) {
                const vm = this;
                vm.relation = null;
                vm.domainId = domain;
            },
            excelInputSuccess(){
                this.$refs.relationMenu.reqTree();
            },
            dbInputSaveSuccess(){
                this.$refs.relationMenu.reqTree();
            }
        },
        created() {
        },
        components: {
            LeftMainLayout,
            RelationMenu,
            ListView
        }
    }
</script>
<style scoped lang="less">

</style>