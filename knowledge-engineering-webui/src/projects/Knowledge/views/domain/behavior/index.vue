<!--
 领域对象管理主页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <left-main-layout class="domain rel">
        <template slot="left">
            <behavior-menu
                    @current-change="handleCurrentChange"
                    @domain-change="handleDomainChange"
                    ref="behaviorMenu"
            />
        </template>
        <template>
            <list-view :behavior="behavior"
                       :domainId="domainId"
                       @excel-input="excelInputSuccess"
                       @dbInput="dbInputSaveSuccess"
            ></list-view>
        </template>
    </left-main-layout>
</template>

<script>
    import BehaviorMenu from './components/BehaviorMenu'
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import ListView from './ListView'


    export default {
        name: 'Behavior',
        data() {
            return {
                behavior: null,
                domainId: ''
            }
        },
        watch: {

        },
        methods: {
            handleCurrentChange(data, node) {
                this.behavior = data;
            },
            handleDomainChange(domainId) {
                const vm = this;
                vm.behavior = null;
                vm.domainId = domainId;
            },
            excelInputSuccess(){
                this.$refs.behaviorMenu.reqTree();
            },
            dbInputSaveSuccess(){
                this.$refs.behaviorMenu.reqTree();
            }
        },
        created() {
        },
        components: {
            LeftMainLayout,
            BehaviorMenu,
            ListView

        }
    }
</script>
<style scoped lang="less">

</style>