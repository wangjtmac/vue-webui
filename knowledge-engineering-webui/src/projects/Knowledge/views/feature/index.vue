<!--
 特征管理主页，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <left-main-layout class="feature rel">
        <template slot="left">
            <catalog-menu @current-change="handleCurrentChange"
                          @domain-change="handleDomainChange"
            ></catalog-menu>
        </template>
        <el-tabs v-model="activeTab"  @tab-click="handleClickTab">
            <el-tab-pane label="列表" name="list" lazy>
                <list-view :catalog="catalog"
                           :domainId="domainId"
                           ref="list">
                </list-view>
            </el-tab-pane>
            <el-tab-pane label="图谱" name="graph" lazy>
                <graph-view :domainId="domainId"
                            :catalog="catalog"
                            ref="graph">
                </graph-view>
            </el-tab-pane>
        </el-tabs>
    </left-main-layout>
</template>

<script>
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout'
    import CatalogMenu from './components/CatalogMenu'
    import ListView from './ListView'
    import GraphView from './GraphView'

    export default {
        name: 'feature',
        data() {
            return {
                domainId: '',
                catalog: null,
                activeTab: 'list',
            }
        },
        watch: {

        },
        methods: {
            handleCurrentChange(data, node) {
                this.catalog = data;
            },
            handleDomainChange(domain) {
                const vm = this;
                vm.catalog = null;
                vm.domainId = domain;
            },
            handleClickTab(tab) {
                const vm = this;
                let { [vm.activeTab]: viewVm } = vm.$refs;
                viewVm && viewVm.$nextTick(() => {
                    viewVm.resize();
                });
            }
        },
        created() {

        },
        components: {
            LeftMainLayout,
            CatalogMenu,
            ListView,
            GraphView
        }
    }
</script>
<style scoped lang="less">
    .el-tabs{
        height: 100%;
        /deep/ .el-tabs__content{
            height: calc(100% - 54px);
            overflow: auto;
        }
        .el-tab-pane{
            height: 100%;
        }
    }
</style>