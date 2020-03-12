<!--
 具有增删改查功能的树，
 @Author: zhanbh
 @Date: 2019-10-21


 可用$refs.tree访问到el-tree
 事件：el-tree各种方法  由于有做数据加工，el-tree各种方法中的data是加工后的数据，原始数据在origin字段中。
 属性：inlineEdit Boolean:是否行内编辑
       addable [fn|Boolean]:是否可以编辑根节点
       nodeKey:行内编辑时必传,键值必须是唯一
       props Object:tree字段配置
       data Array: 数据
       doEdit(data, inputText?行内编辑才有): fn
       doAdd(parentData, inputText?行内编辑才有): fn
       doDelete(data)
 接口：resetFilter() // 重置搜索条件
       doFilter() // 执行过滤
       el-tree 所有接口
-->
<template>
    <div class="editable-tree">
        <div class="tree__header">
            <el-input v-model.trim="keyword"
                      class="tree__search bsb"
                      placeholder="请输入关键字"
                      prefix-icon="el-icon-search"
                      size="small"
                      clearable
                      @blur="doFilter"
                      @keyup.enter.native="doFilter">
            </el-input>
            <div class="tree__btns">
                <slot name="preBtn"></slot>
                <i class="icon-btn el-icon-circle-plus-outline"
                   :class="{'disabled': !isAddable}"
                   title="添加"
                   @click.stop="handleClickAdd"
                ></i>
                <slot name="sufBtn"></slot>
            </div>
        </div>
        <el-tree class="bsb ova tree__main"
                 ref="tree"
                 :props="treeProps"
                 :allow-drag="checkAllowDrag"
                 :node-key="nodeKey"
                 :data="data"
                 v-bind="treeBinds"
                 v-on="treeEvents"
                 @current-change="handleCurrentChange">
            <span class="custom-tree-node" slot-scope="{ node, data }">
                <el-input v-if="inlineEdit && data[nodeKey] === edit.key"
                           v-model.trim="edit.inputText"
                           class="bsb"
                           placeholder="请输入内容"
                           ref="edit"
                           size="small"
                           autofocus
                           maxlength="50"
                           show-word-limit
                           @blur="handleDoneEdit(node, data)"
                           @keyup.enter.native="handleDoneEdit(node, data)"
                           @click.stop.prevent
                 >
                </el-input>
                <template v-else>
                    <span class="node__text mr5" :title="data[treeProps.label]">{{data[treeProps.label]}}</span>
                    <span class="node__btns">
                        <i class="el-icon-remove-outline danger-icon icon-btn"
                           title="删除"
                           @click.stop="handleClickDelete(data)"
                        ></i>
                        <i class="el-icon-edit-outline icon-btn"
                           title="编辑"
                           @click.stop="handleClickEdit(data)"
                        ></i>
                    </span>
                </template>
            </span>
        </el-tree>
    </div>
</template>

<script>
    import { Tree } from 'element-ui';

    // 混入树方法，使组件拥有el-tree的方法
    let treeMethods = {};
    Object.keys(Tree.methods).forEach(key => {
        treeMethods[key] = function (...args) {
            const vm = this;
            return vm.$refs.tree && vm.$refs.tree[key](...args);
        }
    });

    /**
     * 默认的字段属性配置
     * @type {{label: string, children: string, disabled: string}}
     */
    const DEFAULT_PROPS = {
        label: 'label',
        children: 'children',
        disabled: 'disabled'
    };

    /**
     * 默认的树组件属性配置
     * @type {{defaultExpandAll: boolean, highlightCurrent: boolean, expandOnClickNode: boolean}}
     */
    const DEFAULT_TREE_BINDS = {
        defaultExpandAll: true,
        highlightCurrent: true,
        expandOnClickNode: false,
    };

    /**
     * 特殊的键值，空值与添加的值，用于行内编辑，自己添加数据
     * @type {{}}
     */
    const SPECIAL_KEYS = {
        empty: Symbol('empty'),
        add: Symbol('add')
    };

    export default {
        name: "EditableTree",
        inheritAttrs: false,
        mixins: [{ methods: treeMethods }],
        props: {
            allowDrag: Function,
            nodeKey: String,
            props: Object,
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            addable: {
                type: [Boolean, Function],
                default: true
            },

            doEdit: Function, // 必须返回true或者false来表示成功还是失败
            doAdd: Function,
            doDelete: Function,

            // 以下是行内编辑才需要的
            inlineEdit: Boolean
        },
        data() {
            return {
                keyword: '',
                filterTimer: NaN,
                edit: {
                    key: SPECIAL_KEYS.empty,
                    inputText: ''
                },
                current: null
            }
        },
        computed: {
            isAddable() {
                let {current, edit, addable, inlineEdit} = this;

                if (inlineEdit && edit.key !== SPECIAL_KEYS.empty) {
                    return false;
                }

                if (addable instanceof Function) {
                    return addable(current);
                } else {
                    return addable;
                }
            },

            treeProps() {
                return Object.assign({}, DEFAULT_PROPS, this.props);
            },

            /**
             * el-tree的属性
             * @returns object
             */
            treeBinds() {
                const vm = this;
                let { $attrs, filterNodeMethod } = vm;
                let binds = { ...DEFAULT_TREE_BINDS, filterNodeMethod };

                // 将-的key值同一成驼峰法
                Object.keys($attrs).forEach(key => {
                   binds[key.replace(/-[a-z]/g,w => { return w.substring(1).toUpperCase() })] = $attrs[key];
                });

                return binds;
            },

            /**
             *  el-tree的不需要改造的事件
             **/
            treeEvents() {
                const { $listeners } = this;
                let events = {...$listeners};
                delete events['current-change'];

                return events;
            }
        },
        watch: {
            keyword() {
                const vm = this;
                let { filterTimer, doFilter } = vm;

                window.clearTimeout(filterTimer);
                vm.filterTimer = window.setTimeout(doFilter, 200); // 防抖
            },
            data: {
                handler() { // 校验当前节点

                },
                deep: true
            }
        },
        methods: {

            /**
             * 树的过滤方法，目前按路径搜索
             * @param value
             * @param data
             * @param node
             * @returns {boolean}
             */
            filterNodeMethod(value, data, node) {
                const vm = this;

                if (typeof value !== 'string' && value.trim() !== '') {
                    return true;
                }

                if (node.childNodes.length > 0){ // 非叶子节点直接不展示，由叶子节点决定是否展示
                    return false;
                } else {
                    let { treeProps, nodeKey, edit, inlineEdit } = vm;
                    value = value.toLowerCase();

                    while (node.level > 0) {
                        let label = node.data[treeProps.label] || '';

                        if (label.toLowerCase().includes(value) || ( inlineEdit && node.data[nodeKey] === edit.key )) { // 编辑节点一定会展示
                            return true;
                        }

                        node = node.parent; // 本身没匹配，查找父级
                    }

                    return false;
                }
            },

            /**
             * 判断是否可以拖动
             * @param node
             * @returns {boolean}
             */
            checkAllowDrag(node) {
                const vm = this;
                let { allowDrag, edit, inlineEdit } = vm;

                //正在编辑不允许拖动
                if (inlineEdit && edit.key !== SPECIAL_KEYS.empty) {
                    return false;
                }

                if (allowDrag instanceof Function) {
                    return allowDrag(node);
                } else {
                    return  true;
                }
            },

            handleCurrentChange(data, node) {
                const vm = this;

                if (!vm.inlineEdit || data[vm.nodeKey] !== vm.edit.key) { // 非编辑节点
                    vm.current = data;
                    vm.$emit('current-change', data, node);
                } else {
                    vm.$refs.tree.setCurrentKey(vm.current && vm.current[vm.nodeKey]);
                }
            },

            /**
             * 点击新增
             **/
            handleClickAdd() {
                const vm = this;
                let { inlineEdit, current, nodeKey, treeProps } = vm;

                if (inlineEdit) { // 行内编辑

                    // 新增的话要添加树节点
                    let data = {
                        [nodeKey]: SPECIAL_KEYS.add,
                        [treeProps.label]: ''
                    };

                    if (current) {
                        vm.append(data, current)
                    } else {
                        vm.data.unshift(data);
                    }

                    // 新增完节点就等于处理编辑
                    vm.handleClickEdit(data);

                } else { // 外部直接处理

                    if (vm.doAdd instanceof Function) {
                        vm.doAdd(current);
                    }
                }
            },

            /**
             * 处理点击编辑按钮
             * @param data
             */
            handleClickEdit(data) {
                const vm = this;
                let { inlineEdit, edit, nodeKey, treeProps } = vm;

                if (inlineEdit) { // 行内编辑
                    edit.key = data[nodeKey];
                    edit.inputText = data[treeProps.label];
                    vm.$nextTick(() => {
                        vm.$refs['edit'].select();
                    });

                } else { // 外部直接处理
                    if (vm.doEdit instanceof Function) {
                        vm.doEdit(data);
                    }
                }
            },

            /**
             * 解决行内编辑完成事件
             * @param node
             * @param data
             */
            async handleDoneEdit(node, data) {
                const vm = this;
                let { edit, treeProps } = vm;
                let { inputText } = edit;
                let isAdd = edit.key === SPECIAL_KEYS.add;

                if (isAdd) {

                    if (inputText !== '' && vm.doAdd instanceof Function) {
                        let parentNode = node.parent;
                        let result = await vm.doAdd(parentNode.level === 0 ? null : parentNode.data, inputText);

                        if (result === false) { // 新增失败
                            vm.$refs['edit'].select();
                            return false;
                        }
                    }

                    // 删除新增节点
                    vm.remove(node);
                } else {

                    if (inputText !== '' && inputText !== data[treeProps.label] && vm.doEdit instanceof Function) {
                        let result = await vm.doEdit(data, inputText);

                        if (result === false) { // 编辑失败
                            vm.$refs['edit'].select();
                            return false;
                        }
                    }
                }

                edit.key = SPECIAL_KEYS.empty;
                edit.inputText = '';
            },
            handleClickDelete(data) {
                let { doDelete } = this;

                if (doDelete instanceof Function) {
                    doDelete(data);
                }
            },

            // 对外接口

            /**
             * 重置关键字
             **/
            resetFilter() {
                this.keyword = '';
            },

            /**
             * 执行树的过滤，同时删除防抖用的定时器
             **/
            doFilter() {
                const vm = this;
                let { keyword, filterTimer } = vm;

                window.clearTimeout(filterTimer);
                vm.filter(keyword);
            },
        },
        beforeDestroy() {
            const vm = this;
            window.clearTimeout(vm.filterTimer);
        }
    }
</script>

<style scoped lang="less">
    .editable-tree {
        display: flex;
        flex-direction: column;
    }

    /* 头部样式 */
    .tree__header{
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .tree__btns{
            display: flex;
            align-items: center;
            padding: 0 5px;
        }
    }

    /* 图标按钮样式 */
    .icon-btn.disabled {
        cursor: not-allowed !important;
    }
    .icon-btn{
        color: #409eff;
        cursor: pointer;
        font-size: 24px;
    }
    .icon-btn+.icon-btn {
        margin-left: 5px;
    }
    .danger-icon {
        color: #F56C6C;
    }

    /* 拖拽样式重置 */
    /deep/ .el-tree-node.is-drop-inner > .el-tree-node__content{
        background-color: #409eff;
        color: #fff;
    }

    /* 自定义节点内容样式 */
    .custom-tree-node{
        display: flex;
        align-items: center;
        overflow: hidden;
        .node__text{
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .node__btns{
            display: none;
            flex-shrink: 0;
            .icon-btn{
                font-size: 18px;
                cursor: pointer;
                user-select: none;
            }
        }
        /deep/ .el-input__inner{
            height: 26px;
        }
    }
    /deep/ .el-tree-node__content:hover{
        .node__btns{
            display: flex;
        }
    }
</style>