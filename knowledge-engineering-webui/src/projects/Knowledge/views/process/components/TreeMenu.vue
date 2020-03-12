<!--
 流程图左侧树菜单
 @Author: zhanbh
 @Date: 2019-11-27
-->
<template>
    <div class="tree-menu pt10" v-loading="isLoading">
        <el-select v-model="domainId"
                   class="mb10"
                   size="small"
                   filterable
                   placeholder="请选择所属领域"
                   @change="handleChangeDomain"
        >
            <el-option
                    v-for="item in domainList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
            </el-option>
        </el-select>

        <el-tabs v-model="form.dataType" type="card" @tab-click = "handleTabClick">
            <el-tab-pane :label="tagMap.undone.name" :name="tagMap.undone.code"></el-tab-pane>
            <el-tab-pane :label="tagMap.done.name" :name="tagMap.done.code"></el-tab-pane>
        </el-tabs>

        <el-input v-model.trim="form.keyword"
                  class="mb10"
                  size="small"
                  clearable
                  :placeholder="searchText">
            <template #prefix>
                <i class="el-input__icon el-icon-search"></i>
            </template>
        </el-input>

        <el-tree
                ref="tree"
                :data="treeData"
                :node-key="mergedProps.id"
                :props="mergedProps"
                default-expand-all
                highlight-current
                :filter-node-method="treeFilter"
                @current-change="handleTreeCurrentChange">
            <template #default="{ node, data }">
                <span class="custom-tree-node">
                    <span class="mr5 node__text"
                          :title="data[mergedProps.label]">{{ data[mergedProps.label] }}</span>
                    <span v-if="data[mergedProps.isTarget] && !data[mergedProps.isDone]"
                          class="node__btn mr5"
                          @click="handleClickAddProcess(data)">+流程</span>
                </span>
            </template>
        </el-tree>
    </div>
</template>
<script>
    import * as domainApi from '@/projects/Knowledge/api/domainApi';

    export default {
        name: "TreeMenu",
        props: {
            menuApi: {
                type: Function, // {code: 200, result}
                required: true
            },
            searchText: {
                type: String,
                default: '请输入关键字'
            },
            props: Object
        },
        data() {
            const vm = this;
            vm.tagMap = {
                undone: {name: '未建流程', code: '0'},
                done: {name: '已建流程', code: '1'},
            };
            return {
                domainId: '',
                form: {
                    dataType: vm.tagMap.undone.code,
                    keyword: ''
                },
                domainList: [],
                treeData:[],
                dataParentMap: new Map(),
                isLoading: false
            }
        },
        computed: {
            mergedProps() {
                const vm = this;
                return Object.assign({
                    id: 'id',
                    label: 'name',
                    isTarget: 'isTarget',
                    children: 'children',
                    isDone: 'isDone'
                }, vm.props)
            }
        },
        watch: {
            form: {
                handler() {
                    const vm = this;
                    vm.doTreeFilter();
                },
                deep: true
            }
        },
        methods: {
            async initDomainList() {
                const vm = this;
                vm.isLoading = true;
                let data = await domainApi.getAll();
                vm.isLoading = false;

                if (data.code === 200) {
                    vm.domainList = data.domainTree || [];

                    if (vm.domainList.length > 0) {
                        vm.domainId = vm.domainList[0].id;
                        vm.handleChangeDomain( vm.domainId)
                    }
                }
            },

            async initTreeData(domainId) {
                const vm = this;
                vm.isLoading = true;
                let data = await vm.menuApi(domainId);
                vm.isLoading = false;
                let newData = [];

                if (data.code === 200) {
                    newData = data.result || [];
                }
                vm.treeData = newData;
            },

            treeFilter(val, data) {
                const vm = this;
                const {isTarget, isDone, label} = vm.mergedProps;
                let isShow = false;

                if (!data[isTarget]) { // 不是目标节点都不展示，目录会自动随目标节点的展示而展示
                    isShow =  false;

                } else {
                    const {tagMap} = vm;
                    let {keyword, dataType}= vm.form;
                    let isInDone = dataType === tagMap.done.code;

                    if (data[isDone] !== isInDone) {
                        isShow =  false;

                    } else if(!keyword){
                        isShow =  true

                    } else {
                        let pathNode = data;
                        const { dataParentMap } = vm;
                        keyword = keyword.toLowerCase();

                        while (!isShow && pathNode) {
                            isShow = pathNode[label].toLowerCase().indexOf(keyword) !== -1 ;
                            if (!isShow) { // 自身没命中，查找父级分类
                                pathNode = dataParentMap.get(pathNode);
                            }
                        }
                    }
                }

                return isShow;
            },

            doTreeFilter() {
                const vm = this;
                vm.$refs.tree && vm.$refs.tree.filter();
            },

            /**
             * 生成节点与父节点的映射
             * @param list
             * @param parent
             */
            geneDataParentMap(list, parent) {
                const vm = this;
                const {dataParentMap, mergedProps} = vm;
                if (Array.isArray(list)) {
                    list.forEach(item => {
                        dataParentMap.set(item, parent);
                        vm.geneDataParentMap(item[mergedProps.children], item);
                    });
                }
            },

            async handleChangeDomain(domainId) {
                const vm = this;

                await vm.initTreeData(domainId);

                let {form} = vm;
                form.keyword = '';
                form.dataType = vm.tagMap.undone.code;

                vm.dataParentMap.clear();
                vm.geneDataParentMap(vm.treeData);

                vm.doTreeFilter();

                // 树当前选中节点已置空，手动触发
                vm.handleTreeCurrentChange(null);
            },

            handleTabClick() {
                this.form.keyword = '';
            },

            handleClickAddProcess(data) {
                const vm = this;
                vm.$emit('add-process',data, vm.getPath(data), vm.getCurrentDomain());
            },

            handleTreeCurrentChange(data = null, node) {
                const vm = this;

                if (data === null) { // 置空
                    vm.$emit('change-target', data);
                } else {
                    let {isTarget, isDone} = vm.mergedProps;

                    if (data[isTarget] && data[isDone]) {
                        vm.$emit('change-target', data);
                    }
                }
            },

            /**
             * 已经更改完数据是否已建流程状态
             * @param data
             */
            handleChangedDateType(data) {
                const vm = this;
                vm.form.dataType =  data[vm.mergedProps.isDone] ? vm.tagMap.done.code : vm.tagMap.undone.code;
                vm.$nextTick(() => {
                    vm.$refs.tree.setCurrentKey(data.id);
                    vm.handleTreeCurrentChange(data[vm.mergedProps.isDone] ? data : null);
                })
            },

            getCurrentDomain() {
                const vm = this;
                return vm.getDomain(vm.domainId);
            },

            getDomain(id) {
                return this.domainList.find(item => item.id === id);
            },

            getPath(obj){
                const vm = this;
                let path = [];

                if (typeof obj !== 'object') {
                    obj = vm.getNode(obj);
                }

                if (obj !== null) {
                    const {dataParentMap} = vm;
                    while (obj !== null && obj !== undefined) {
                        path.unshift(obj);
                        obj = dataParentMap.get(obj);
                    }
                }
                return path;
            },

            getNode(id){
                const vm = this;
                let idProp = vm.mergedProps.id;
                let list = vm.dataParentMap.keys();
                let obj = null;

                for (let item of list) {
                    if (item[idProp] === id) {
                        obj = item;
                    }
                }

                return obj;
            },

            getTree() {
                return this.treeData;
            }
        },
        created() {
            this.initDomainList();
        }
    };
</script>
<style scoped lang="less">
    .tree-menu{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
    .el-tabs /deep/ .el-tabs__nav{
        width: 100%;
        text-align: center;
        .el-tabs__item{
            width: 50%;
        }
    }
    .custom-tree-node{
        display: flex;
        align-items: center;
        overflow: hidden;
        .node__text{
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .node__btn{
            display: none;
            flex-shrink: 0;
            font-size: 12px;
            cursor: pointer;
            color: #409EFF;
            user-select: none;
        }
    }
    /deep/ .el-tree-node__content:hover{
        .node__btn{
            display: inline-block;
        }
    }
    .el-tree{
        height: calc(100% - 140px);
        box-sizing: border-box;
        overflow: auto;
        /deep/ .el-tree__empty-block{
            height: auto;
        }
    }
</style>