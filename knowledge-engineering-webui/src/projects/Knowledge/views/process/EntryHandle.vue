<template>
    <left-main-layout
            class="offline-rule-process"
            v-loading="isLoading">
        <template #left>
            <tree-menu ref="treeMenu"
                       :menu-api="initTreeData"
                       search-text="对象类型"
                       @add-process="handleAddProcess"
                       @change-target="handleChangeTarget">
            </tree-menu>
        </template>

    </left-main-layout>
</template>

<script>
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout';
    import TreeMenu from './components/TreeMenu';
    import Flow from './components/Flow';
    import FlowNode from './components/flowPanel/FlowNode';
    import Toolbar from './components/Toolbar';

    import * as flowApi from '@/projects/Knowledge/api/flowApi';
    import layoutMixin from './flowLayoutMixin';
    export default {
        name: "EntryHandle" ,
        mixins: [layoutMixin],
        data(){
            return {
                currentData: null,
                nodeList: [],
                lineList: [],
                isLoading: false,
                form: {
                    visible: false,
                    nodeData: null,
                    domain: null,
                    dataPath: []
                }
            }
        },
        methods : {
            async initTreeData(domainId) {
                const vm = this;
                let data = await flowApi.getOfflineRuleScheme(domainId);

                let newData = [];
                if (data.code === 200) {
                    newData = vm.cleanTreeData(data.dataSourceList || []);
                }
                return {
                    code: data.code,
                    result: newData
                };
            },
            /**
             * 添加流程，添加成功则修改数据状态，注意多继承
             * @param data
             * @param path
             * @param domain
             * @returns {Promise<void>}
             */
            async handleAddProcess(data, path, domain) {
                const vm = this;
                vm.isLoading = true;
                let respData = await vm.addFlow(path, domain);
                vm.isLoading = false;

                if (respData.code === 200) {
                    vm.changeDataByTransId(data, respData.result);
                }
            },
            /**
             * 修改当前数据，并获取流程图
             * @param data
             */
            handleChangeTarget(data) {
                const vm = this;

                if (data !== vm.currentData) {
                    vm.currentData = data;
                    vm.form.visible = false;
                    vm.initFlowData();
                }
            },
            /**
             * 对后台数据进行清洗
             * @param list
             * @param level 库数据固定三级
             */
            cleanTreeData(list = [], level = 0) {
                const vm = this;
                let nameMap = ['dataSourceName', 'dataObjName', 'conditionName'];
                let targetLevel = 2;
                let doneSign = { field: 'createType', value: '1'};

                list.forEach((item, index) => {
                    list[index] = {
                        id: `${new Date().getTime()}-${Math.random()}`, // 业务无关id,
                        name: item[nameMap[level]],
                        children: vm.cleanTreeData(item.children, level + 1),
                        isTarget: level === targetLevel,
                        isDone: level === targetLevel && item[doneSign.field] === doneSign.value,
                        origin: item
                    }
                });

                return list;
            },
        },
        components: {
            Flow,
            FlowNode,
            LeftMainLayout,
            TreeMenu,
            Toolbar,
        }
    }
</script>

<style scoped>

</style>