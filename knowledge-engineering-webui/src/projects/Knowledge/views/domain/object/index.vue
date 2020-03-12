<!--
 领域对象管理主页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <left-main-layout class="domain rel">
        <template slot="left">
            <object-menu ref="objectMenu"
                         @current-change="handleCurrentChange"
                         @domain-change="handleDomainChange"
            />
        </template>
        <template>
            <el-tabs v-model="activeTab" @tab-click="handleClick">
                <el-tab-pane label="列表" name="list">
                    <list-view :object="object"
                               :domainId="domainId"
                               @excel-input="excelInputSuccess"
                    ></list-view>
                </el-tab-pane>
                <el-tab-pane label="图谱" name="graph">
                    <keep-alive>
                        <graph-view  v-if="visible"
                                     :object="object"
                                     :domainId="domainId"
                        ></graph-view>
                    </keep-alive>
                </el-tab-pane>
            </el-tabs>
        </template>
    </left-main-layout>
</template>

<script>
    import ObjectMenu from './components/ObjectMenu'
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import ListView from './ListView'
    import GraphView from './GraphView'

    export default {
        name: 'Object',
        data() {
            return {
                object: null,
                activeTab: 'list',
                visible: false,
                domainId: ''
            }
        },
        watch: {

        },
        methods: {
            handleCurrentChange(data, node) {
                this.object = data;
            },
            handleDomainChange(domain) {
                const vm = this;
                vm.object = null;
                vm.domainId = domain;
            },
            excelInputSuccess(){
                this.$refs.objectMenu.reqTree();
            },
            handleClick(tab, event) {
                const vm = this;
                if (event.target.getAttribute('id') === "tab-graph") {
                    vm.visible=true;
                }else {
                    vm.visible=false;
                }
            }
        },
        created() {
        },
        components: {
            LeftMainLayout,
            ObjectMenu,
            ListView,
            GraphView
        }
    }
</script>
<style scoped lang="less">
    .el-tabs {
        height: 100%;

    /deep/ .el-tabs__content {
        height: calc(100% - 54px);
        overflow: auto;
    }

    .el-tab-pane {
        height: 100%;
    }

    }
</style>