<!--
 特征主页左侧分类菜单，
 @Author: zhanbh
 @Date: 2019-10-19
-->
<template>
    <div class="relation-menu height100" v-loading="isLoading">
        <el-select v-model="form.domain"
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
        <editable-tree ref="tree"
                       class="ovh"
                       :key="form.domain"
                       :data="list"
                       :props="treeProps"
                       :addable="form.domain !== ''"
                       :do-add="handleAdd"
                       :do-edit="handleEdit"
                       :do-delete="handleDelete"
                       draggable
                       :allow-drop="allowDrop"
                       @current-change="handleCurrentChange"
                       @node-drop="handleNodeDrop"
                       @node-drag-start="handleNodeDragStart">
            <!--<template slot="sufBtn">
                <i  class="icon-btn icon icon-excel"
                    title="Excel导入关系">
                </i>
                <i class="icon-btn icon icon-sjkdr"
                   title="库导入关系">
                </i>
            </template>-->
        </editable-tree>
        <el-dialog
                :title="edit.title"
                :visible.sync="edit.dialogVisible"
                :close-on-click-modal="false"
                append-to-body
                width="550px"
                @closed="handleClosedEditDialog"
        >
            <edit :data="edit.data"
                  ref="edit"
                  :object-tree="list"
                  :domain-id="form.domain"
                  @saved="handleEditSaved"
                  @cancel="edit.dialogVisible = false"
            />
        </el-dialog>
    </div>
</template>

<script>
    import EditableTree from '@/projects/Knowledge/components/EditableTree'
    import Edit from '../Edit';

    export default {
        name: "RelationMenu",
        data() {
            this.treeProps = {
                label: 'name',
                children: 'children'
            }
            return {
                form: {
                    domain: ''
                },
                domainList: [],
                list: [],
                edit: {
                    dialogVisible: false,
                    title: '',
                    data: null,
                },
                isLoading: false
            }
        },
        methods: {
            async reqDelete(params, isCascader) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('deleteRelationType',{
                    id: params.id,
                    isDeleteObjAndRelation: isCascader ? 1 : 0,
                    domianObjType: '1'
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '删除领域对象异常');
                    return false;
                }
            },
            async reqUpdateRelation(params) {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.post('updateObjRelation',params).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                if (data.code === 200) {
                    return true;
                } else {
                    vm.$message.error(data.msg || '修改对象父级异常');
                    return false;
                }
            },
            async reqDomainList() {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.get('getAllDomain').catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                let list = [];
                if (data.code === 200) {
                    list = data.domainTree || [];
                } else {
                    vm.$message.error(data.msg || '查询领域列表异常');
                }
                vm.domainList = list;
                if (list.length > 0) {
                    vm.form.domain = list[0].id;
                }
            },
            async reqTree() {
                const vm = this;
                vm.isLoading = true;
                let {data} = await vm.$axios.get(`getDomainTree`,{
                    params: {
                        domainId: vm.form.domain,
                        domainObjType: '1'
                    }
                }).catch((error) => {
                    return {data: {msg: '服务器异常，请联系管理员'}};
                });
                vm.isLoading = false;
                let tree = [];
                if (data.code === 200) {
                    tree = data.domainTrees || [];
                } else {
                    vm.$message.error(data.msg || '查询领域关系列表异常');
                }
                vm.list = tree;
            },
            async init(){
                const vm = this;
                await vm.reqDomainList();
                vm.initDataByDomain();
            },
            initDataByDomain() {
                const vm = this;
                vm.$emit('domain-change', vm.form.domain);
                if (vm.$refs.tree) {
                    vm.$refs.tree.resetFilter();
                }
                vm.reqTree();
            },
            /**
             * 不能拖拽到同父亲，同父亲只是改变顺序，没意义
             * 不能拖拽到子树下，，避免环
             * @param node
             * @param dropNode
             * @param type
             * @returns {boolean}
             */
            allowDrop(node, dropNode, type) {
                let data = node.data;
                let selfIdSet = new Set();
                let undo = [data];
                while ( undo.length > 0 ) {
                    let item = undo.shift();
                    selfIdSet.add(item && item.id);
                    if ( item && item.children && item.children.length > 0 ) {
                        undo.push(...item.children);
                    }
                }

                // 如果祖先在自身子树范围内，不允许
                let parentNode = dropNode.parent;
                let level = parentNode.level;
                while (level > 0) {
                    let data = parentNode.data;
                    if (selfIdSet.has(data.id)) {
                        return false;
                    }
                    parentNode = parentNode.parent;
                    level--;
                }

                // 判断自身
                if (type === 'inner') {
                    if (selfIdSet.has(dropNode.data.id)) {
                        return false;
                    }
                    return node.parent !== dropNode;
                } else {
                    return node.parent !== dropNode.parent;
                }
            },
            handleAdd(parent) {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '新增关系';
                edit.data = null;
            },
            handleEdit(data, oldData) {
                const {edit} = this;
                edit.dialogVisible = true;
                edit.title = '编辑关系';
                edit.data = data;
            },
            handleDelete(data) {
                const vm = this;
                vm.$confirm('此操作将永久删除该领域关系, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(async () => {
                    if (data.children && data.children.length > 0) {
                        vm.$confirm('是否删除本身及其子关系?', '选择', {
                            confirmButtonText: '仅本身',
                            cancelButtonText: '本身及子关系',
                            type: 'success ',
                            showClose: false
                        }).then(async () => {
                            return await vm.reqDelete(data, false)
                        }).catch(async () => {
                            return await vm.reqDelete(data, true)
                        }).then(success => {
                            if(success) {
                                vm.reqTree();
                            }
                        });
                    } else {
                        let success = await vm.reqDelete(data, false);
                        if(success) {
                            vm.reqTree();
                        }
                    }

                }).catch(_ => {});;
            },
            handleEditSaved(data) {
                const vm = this;
                vm.edit.dialogVisible = false;
                vm.reqTree();
            },
            handleCurrentChange(data, node) {
                this.$emit('current-change', data);
            },
            handleChangeDomain() {
                this.initDataByDomain();
            },
            handleClosedEditDialog() {
                const vm = this;
                vm.edit.data = null;
                vm.$refs.edit.clearForm();
            },
            handleNodeDragStart(Node) {

            },
            async handleNodeDrop (node, dropNode, type) {
                const vm = this;
                let data = node.data;
                let params = { id: data.id};
                if (type === 'inner') {
                    params.parentId = dropNode.data.id;
                } else {
                    params.parentId = dropNode.data.pid;
                }
                params.oldParentId = data.pid;
                await vm.reqUpdateRelation(params);
                vm.reqTree();
            }
        },
        created() {
            this.init()
        },
        components: {
            EditableTree,
            Edit
        }
    }
</script>

<style scoped lang="less">
    .relation-menu {
        display: flex;
        flex-direction: column;
    }
</style>




