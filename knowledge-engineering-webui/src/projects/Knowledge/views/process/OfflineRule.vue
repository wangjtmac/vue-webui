<!--
 离线规则
 @Author: zhanbh
 @Date: 2019-11-26
-->
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

                <template  slot="form">
                    <keep-alive>
                        <offline-form v-if="form.visible"
                                      title="计算插件"
                                      :object-feature="form.objectFeature"
                                      :domain="form.domain"
                                      @cancel="form.visible = false">
                        </offline-form>
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
    import OfflineForm from './components/flowForms/OfflineForm'

    import * as flowApi from '@/projects/Knowledge/api/flowApi';
    import layoutMixin from './flowLayoutMixin';

    export default {
        name: "offline-rule-process",
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
                    objectFeature: null
                }
            };
        },
        computed: {
        },
        methods: {
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
             * 根据路径及领域数据生成离线流程参数
             * 路径的倒一是对象特征，倒二就是领域对象
             **/
            geneParamsForOffLine(path, domain) {
                if (domain && Array.isArray(path) && path.length > 1) {
                    return {
                        domainObject: {
                            domainId: domain.id,
                            domainCode: domain.code,
                            domainObjectId: path[path.length - 2].origin.id,
                            domainObjectName: path[path.length - 2].origin.name,
                            domainObjectFeatures: [{
                                objectFeatureId: path[path.length - 1].origin.id,
                                objectFeatureName: path[path.length - 1].origin.featureName,
                            }]
                        }
                    }
                } else {
                    return null;
                }
            },

            /**
             *  初始化流程图图数据
             **/
            async initFlowData() {
                const vm = this;
                let { currentData } = vm;
                let id = currentData.id;

                let [nodeList, lineList] = [[], []];

                if (currentData !== null) {
                    let treeVm = vm.$refs.treeMenu;
                    let domain = treeVm.getCurrentDomain();
                    let path = treeVm.getPath(currentData);

                    vm.isLoading = true;
                    let data = await flowApi.getOfflineGraph(vm.geneParamsForOffLine(path, domain));

                    if (vm.currentData !== null && vm.currentData.origin.id === id) {
                        vm.isLoading = false;

                        if (data.code === 200) {
                            nodeList = data.result.nodeList || [];
                            nodeList.forEach(item => item.id = item.name);
                            lineList = data.result.edgeList || [];
                        }
                    } else {
                        return ;
                    }
                } else {
                    vm.isLoading = false;
                }

                vm.nodeList = nodeList;
                vm.lineList = lineList;

                // 进行自动布局
                vm.autoLayout();
            },

            /**
             * 对后台数据进行清洗
             * @param list
             */
            cleanTreeData(list = []) {
                const vm = this;
                let nameMap = {
                    object: 'name',
                    feature: 'featureName'
                };
                let featureSign = { field: 'isObjFeature', value: '1'};
                let doneSign = { field: 'createType', value: '1'};

                list.forEach((item, index) => {
                    let isTarget = item[featureSign.field] === featureSign.value;
                    list[index] = {
                        id: item.id,
                        name: isTarget ? item[nameMap.feature] : item[nameMap.object],
                        children: vm.cleanTreeData(item.children),
                        isTarget,
                        isDone: isTarget && item[doneSign.field] === doneSign.value,
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
                let respData = await flowApi.createOfflineComputeFlow(vm.geneParamsForOffLine(path, domain));
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
                let { form, currentData = {} } = vm;

                if (data.isClick && !form.visible) {
                    let origin = currentData.origin || {};
                    form.nodeData = data;
                    form.objectFeature = {
                        id: origin.id,
                        objModelId: origin.pid
                    };
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
            OfflineForm
        }
    };
</script>
<style scoped>

</style>