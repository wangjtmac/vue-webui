<!--
 库导入流程页面
 @Author: zhanbh
 @Date: 2019-11-26
-->
<template>
    <left-main-layout
            class="offline-db-process"
            v-loading="isLoading">
        <template #left>
            <tree-menu ref="treeMenu"
                       :menu-api="initTreeData"
                       search-text="数据库表名搜索"
                       @add-process="handleAddProcess"
                       @change-target="handleChangeTarget">
            </tree-menu>
        </template>
        <template #default>
            <flow :key="currentData ? currentData.id : ''"
                  ref="flow"
                  :node-list="nodeList"
                  :line-list="lineList">
                <toolbar slot="toolbar"
                         :run-method="runMethod"
                         :stop-method="stopMethod"
                         :delete-method="deleteMethod"
                         :current-data="currentData"
                         v-show="currentData !== null">
                </toolbar>
                <flow-node slot-scope="{data}"
                           :ref="`node_${data.id}`"
                           :data="data"
                           :is-active="form.visible && form.nodeData === data"
                           @dblclick="handleDblClickNode(data)">
                </flow-node>

                <template slot="form">
                    <keep-alive>
                        <db-form v-if="form.visible"
                                 title="计算插件"
                                 v-bind="form"
                                 @cancel="form.visible = false"
                                 @saved="form.visible = false">
                        </db-form>
                    </keep-alive>
                </template>
            </flow>
        </template>
    </left-main-layout>
</template>
<script>
    import LeftMainLayout from '@/projects/Knowledge/components/LeftMainLayout';
    import TreeMenu from './components/TreeMenu';
    import Flow from './components/Flow';
    import FlowNode from './components/flowPanel/FlowNode';
    import Toolbar from './components/Toolbar';
    import DbForm from './components/flowForms/DBForm';

    import * as flowApi from '@/projects/Knowledge/api/flowApi';
    import layoutMixin from './flowLayoutMixin';

    export default {
        name: "OfflineDBProcess",
        mixins: [layoutMixin],
        props: {},
        data() {
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
            };
        },
        computed: {
        },
        methods: {
            async initTreeData(domainId) {
                const vm = this;
                let data = await flowApi.getDBMenuTree(domainId);

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
             * @param path 库数据固定三级
             * @param domain 领域数据
             **/
            async addFlow(path, domain) {
                return await flowApi.createDBImportFlow({
                    domainId: domain.id,
                    domainCode: domain.code,
                    instanceDatasourceId: domain.instanceDatasourceId,
                    dataSourceId: path[0].origin.id,
                    tableId: path[1].origin.id,
                    tableName: path[1].origin.dataObjName,
                    nodeCondition: path[2].origin.id,
                    domainConceptType: path[2].origin.domainObjType
                });
            },

            /**
             *  初始化流程图图数据
             **/
            async initFlowData() {
                const vm = this;
                let { currentData } = vm;

                let [nodeList, lineList] = [[], []];

                if (currentData === null) {
                    vm.isLoading = false;
                } else {
                    let { id, domainObjType } = currentData.origin;

                    vm.isLoading = true;
                    let data = await flowApi.getDbImportGraph({
                        nodeCondition: id,
                        domainConceptType: domainObjType || '0'
                    });

                    if (vm.currentData !== null && vm.currentData.origin.id === id) {
                        vm.isLoading = false;

                        if (data.code === 200) {
                            nodeList = data.result.nodeList || [];
                            nodeList.forEach(item => item.id = item.name);
                            lineList = data.result.edgeList || [];
                        }
                    }
                 }

                vm.nodeList = nodeList;
                vm.lineList = lineList;

                // 进行自动布局
                vm.autoLayout();
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

            /**
             * 更改数据是否已建流程的状态
             * 存在多继承，故遍历整颗树
             **/
            changeDataByTransId(data, transId = '') {
                const vm = this;
                let undoNode = [...vm.$refs.treeMenu.getTree()];

                let isDone = Boolean(transId) && 0 !== transId;

                // 由于多继承，一个节点会存在多个父级
                while (undoNode.length > 0) {
                    let nodeData = undoNode.shift();

                    if (nodeData.origin.id === data.origin.id) {
                        nodeData.isDone = isDone;
                        nodeData.origin.transId =  transId;
                    }

                    if (Array.isArray(nodeData.children)) {
                        undoNode.push(...nodeData.children);
                    }
                }
                vm.$refs.treeMenu.handleChangedDateType(data);
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

            handleDblClickNode(data) {
                const vm = this;
                let {form, currentData} = vm;

                if (data.isClick && !form.visible) {
                    form.nodeData = data;
                    form.dataPath = vm.$refs.treeMenu.getPath(currentData);
                    form.domain = vm.$refs.treeMenu.getCurrentDomain();
                    form.visible = true;
                }
            },

            async runMethod() {
                const vm = this;
                let { currentData } = vm;

                vm.isLoading = true;
                await flowApi.startTrans(currentData.origin.transId);
                vm.isLoading = false;
            },

            async stopMethod() {
                const vm = this;
                let { currentData } = vm;

                vm.isLoading = true;
                await flowApi.stopTrans(currentData.origin.transId);
                vm.isLoading = false;
            },

            async deleteMethod() {
                const vm = this;
                let { currentData } = vm;

                vm.isLoading = true;
                let data = await flowApi.deleteTrans(currentData.origin.transId);
                vm.isLoading = false;

                if (data.code === 200) {
                    vm.changeDataByTransId(currentData, '');
                }
            }
        },
        created() {
        },
        components: {
            Flow,
            FlowNode,
            LeftMainLayout,
            TreeMenu,
            Toolbar,
            DbForm
        }
    };
</script>
<style scoped>
</style>